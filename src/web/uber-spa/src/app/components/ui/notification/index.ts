import { Component, EventEmitter, Output } from '@angular/core'
import { CloseButton } from '../base/closeButton'

@Component({
  standalone: true,
  selector: 'Notification',
  imports: [CloseButton],
  template: `
    <div class="w-full bg-[#f1f1f1] text-black h-min py-5 text-[15px]">
      <div class="relative max-w-[1280px] flex items-center justify-between mx-auto px-2">
        <p>
          <ng-content></ng-content>
        </p>
        <CloseButton 
          (click)="closed.emit()" 
          [small]="true" 
        >
        </CloseButton>
      </div>
    </div>
  `
})
export class Notification {
  @Output() closed = new EventEmitter()
}