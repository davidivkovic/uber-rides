import { Component, EventEmitter, Output } from '@angular/core'
import { CloseButton } from '../base/closeButton'

@Component({
  standalone: true,
  selector: 'Notification',
  imports: [CloseButton],
  template: `
    <div class="relative w-full bg-black text-white h-min px-8 py-5 text-[15px]">
      <ng-content></ng-content>
      <CloseButton 
        (click)="closed.emit()" 
        [small]="true" 
        class="absolute flex right-7 inset-y-0"
      >
      </CloseButton>
    </div>
  `
})
export class Notification {
  @Output() closed = new EventEmitter()
}