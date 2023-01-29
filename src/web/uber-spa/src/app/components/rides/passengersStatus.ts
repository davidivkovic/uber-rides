import { Component, EventEmitter, Input, Output } from '@angular/core'
import { NgIf, NgFor, NgClass } from '@angular/common'
import { CloseButton } from '../ui/base/closeButton'
import { PFP } from '@app/utils'

@Component({
  standalone: true,
  selector: 'PassengersStatus',
  imports: [NgIf, NgFor, CloseButton, NgClass, PFP],
  template: `
    <div *ngIf="passengers?.length">
      <h3 class="mb-0.5 tracking-wide">Passengers</h3>
      <div
        *ngFor="let passenger of passengers"
        class="flex items-center space-x-3 py-1"
        [ngClass]="{ 'pr-2' : !canRemove }"
      >
        <img [src]="passenger.profilePicture | PFP" class="w-7 h-7 rounded-full object-cover"/>
        <h3 class="flex-1 leading-4 text-[15px] tracking-wide mt-0.5">{{ passenger.firstName}} {{ passenger.lastName }}</h3>
        <svg *ngIf="!passenger.accepted && !passenger.declined && !overrideOnline" class="animate-spin ml-auto mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p *ngIf="!passenger.accepted && !passenger.declined && !overrideOnline" class="text-sm">Pending...</p>
        <div 
          *ngIf="passenger.accepted || overrideOnline" 
          class="w-[7px] h-[7px] ml-auto rounded-full bg-green-600 mt-0.5"
          title="Online"
        >
        </div>
        <p *ngIf="passenger.declined" class="ml-auto rounded text-white px-2 py-px text-[13px] bg-red-600">Declined</p>
        <CloseButton 
          *ngIf="canRemove"
          [extraSmall]="true"
          (click)="passengerRemoved.emit(passenger)"
          class="mt-1"
        >
        </CloseButton>
      </div>
    </div>
  `
})
export default class PassengersStatus {
  @Input() passengers: any[]
  @Input() canRemove = true
  @Input() overrideOnline = false
  @Output() passengerRemoved = new EventEmitter()
}