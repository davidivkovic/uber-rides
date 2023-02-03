import { NgClass, NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { PFP } from '@app/utils'

@Component({
  selector: 'DriverDetails',
  standalone: true,
  imports: [NgIf, NgClass, PFP],
  template: `
    <div id="driver-details" *ngIf="driver" class="flex items-center">
      <div class="relative">
        <h3 
          *ngIf="driver.rating > 0"
          class="absolute text-[13px] bottom-0 -right-2 px-1 rounded-md bg-[#eeeeee] leading-4"
        >
          {{ driver.rating.toFixed(1) }}
        </h3>
        <img 
          [src]="driver.profilePicture | PFP"
          [ngClass]="{
            'w-11 h-11': !small && !large,
            'w-[52px] h-[52px]': large
          }"
          class="rounded-full object-cover" 
        />
      </div>
      <div class="ml-3">
        <div class="flex items-center gap-x-2">
          <h3 
            class="tracking-wide"
            [ngClass]="{
              'text-[15px] leading-4': !small && !large,
              'text-lg leading-5': large
            }"
            >
            {{ driver.firstName }} {{ driver.lastName }}
          </h3>
          <h3 
            *ngIf="driver.blocked"
            class="text-xs bg-red-100 border border-red-900/40 px-1 rounded text-red-700 w-fit tracking-wide"
          >
            Blocked
          </h3>
        </div>
        <p           
          [ngClass]="{
            'text-[13px]': !small && !large,
            'text-sm': large
          }"
        >
          {{ email ? driver.email : driver.phoneNumber }}
        </p>
      </div>
    </div>
  `
})
export default class DriverDetails {
  @Input() driver: any
  @Input() small = false
  @Input() large = false
  @Input() email = false
}