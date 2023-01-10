import { NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'DriverDetails',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="driver" class="flex items-center">
      <div class="relative">
        <h3 class="absolute text-[13px] bottom-0 -right-1 px-0.5 rounded-md bg-[#eeeeee] leading-4">
          {{ driver.rating.toFixed(1) }}
        </h3>
        <img class="w-11 h-11 rounded-full object-cover" [src]="driver.profilePicture" />
      </div>
      <div class="ml-3">
        <p class="leading-4">{{ driver.firstName }} {{ driver.lastName }}</p>
        <p class="text-[13px]">{{ driver.phoneNumber }}</p>
      </div>

    </div>
  `
})
export default class DriverDetails {
  @Input() driver: any
}