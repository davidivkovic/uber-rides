import { AfterViewInit, Component, ElementRef, Injector, QueryList, ViewChildren } from '@angular/core'
import { NgComponentOutlet, NgForOf } from '@angular/common'
import { DialogData, dialogStore } from 'src/app/stores'

@Component({
  selector: 'DialogOutlet',
  standalone: true,
  imports: [NgForOf, NgComponentOutlet],
  template: `
    <dialog 
      *ngFor="let dialog of dialogStore.dialogs; trackBy: dialogIdentity"
      #dialog
      [id]="dialog.id"
      class="backdrop:bg-black/25"
    >
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
        setTimeout(() => dialog.showModal(), 0)
      })
    })
  }
}