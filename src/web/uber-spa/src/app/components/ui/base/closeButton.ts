import { NgClass } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
  standalone: true,
  selector: 'CloseButton',
  imports: [NgClass],
  template: `
    <button class="cursor-pointer p-0.5">
      <svg [ngClass]="[small ? 'w-5 h-5' : 'w-7 h-7']" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `
})
export class CloseButton {
  @Input() small: boolean
}