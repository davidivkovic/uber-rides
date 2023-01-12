import { NgClass, NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'DriverDetails',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <div *ngIf="driver" class="flex items-center">
      <div class="relative">
        <h3 
          *ngIf="driver.rating > 0"
          class="absolute text-[13px] bottom-0 -right-2 px-1 rounded-md bg-[#eeeeee] leading-4"
        >
          {{ driver.rating.toFixed(1) }}
        </h3>
        <img 
          [src]="driver.profilePicture"
          [ngClass]="{
            'w-11 h-11': !small && !large,
            'w-[52px] h-[52px]': large
          }"
          class="rounded-full object-cover" 
        />
      </div>
      <div class="ml-3">
        <h3 
          [ngClass]="{
            'text-[15px] leading-4': !small && !large,
            'text-lg leading-5': large
          }"
        >
          {{ driver.firstName }} {{ driver.lastName }}
        </h3>
        <p           
          [ngClass]="{
            'text-[13px]': !small && !large,
            'text-sm': large
          }"
        >
          {{ driver.phoneNumber }}
        </p>
      </div>
    </div>
  `
})
export default class DriverDetails {
  @Input() driver: any
  @Input() small = false
  @Input() large = false
}