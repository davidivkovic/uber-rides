import { AfterViewInit, Component, ElementRef, Injector, QueryList, ViewChildren } from '@angular/core'
import { NgComponentOutlet, NgForOf, NgIf } from '@angular/common'
import { DialogData, dialogStore } from '@app/stores'
import { CloseButton } from '@app/components/ui/base/closeButton'

@Component({
  standalone: true,
  selector: 'DialogOutlet',
  imports: [NgIf, NgForOf, NgComponentOutlet, CloseButton],
  template: `
    <dialog 
      *ngFor="let dialog of dialogStore.dialogs; trackBy: dialogIdentity"
      #dialog
      [id]="dialog.id"
      class="backdrop:bg-black/25 rounded-lg"
    >
      <CloseButton *ngIf="!dialog.props?.noCloseButton" (click)="dialog.close()" class="absolute right-2 top-2"></CloseButton>
      <ng-container *ngComponentOutlet="dialog.component(); injector: createInjector(dialog)"></ng-container>
    </dialog>
  `
})
export default class DialogOutlet implements AfterViewInit {
  @ViewChildren('dialog') dialogs: QueryList<HTMLDialogElement>

  dialogStore = dialogStore
  injectors = {}

  dialogIdentity = (index: number, dialog: DialogData) => dialog.id

  createInjector(dialog: DialogData): Injector {
    if (!this.injectors[dialog.id]) {
      this.injectors[dialog.id] = Injector.create({
        providers: [{ provide: DialogData, useValue: dialog }],
      })
    }
    return this.injectors[dialog.id]
  }

  removeInjector(id: string) {
    delete this.injectors[id]
  }

  ngAfterViewInit() {
    this.dialogs.changes.subscribe((dialogs: ElementRef<HTMLDialogElement>[]) => {
      dialogs.forEach(dialogRef => {
        const dialog = dialogRef.nativeElement
        dialogStore.setNativeElement(dialog)
        dialog.onclose = () => this.removeInjector(dialog.id)
        if (document.contains(dialog) && !dialog.open) {
          setTimeout(() => dialog.showModal(), 0)
        }
      })
    })
  }
}