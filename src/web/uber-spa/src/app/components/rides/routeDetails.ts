import { Component, Input } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { formatDistance, formatDuration } from '@app/utils'

@Component({
  selector: 'RouteDetails',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  template: `
    <div class="relative px-1 pb-2.5 rounded-md pl-3 pt-2" [ngClass]="[background]">
      <div 
        *ngFor="let stop of stops; index as index;" 
        [ngClass]="{'w-[240px]' : index === stops.length - 1}"
        class="flex"
      >
        <div class="mr-2 -mb-2.5 mt-6 z-10">
          <div 
            class="w-1.5 h-1.5 border-2 border-black"
            [ngClass]="{ 'rounded-full' : index !== stops.length - 1 }"
          >
          </div>
          <div 
            *ngIf="index !== stops.length - 1" 
            class="w-[2px] h-full ml-[2px] my-[4px] bg-black"
          >
          </div>
        </div>
        <div class="">
          <p 
            class="text-zinc-500 -mb-1.5 -mt-0.5" 
            [ngClass]="{
              'text-sm': small, 
              'pb-1': small,
              'text-[15px]': !small
            }"
          >
            {{ index == 0 ? 'From' : index < stops.length - 1 ? 'Stop' : 'To' }}
          </p>
          <h3 class="tracking-wide" [ngClass]="{'text-base': small, 'text-lg': !small }">
            {{ formatAddress(stop.address) }}
          </h3>
        </div>

      </div>
      <div *ngIf="distance + duration > 0" class="absolute right-3 bottom-3 text-right z-10">
        <h3 class="text-xl leading-5 mt-0.5">{{ formatDistance(distance) }}</h3>
        <p class="text-sm text-gray-500">approx. {{ formatDuration(duration) }}</p>
      </div>
    </div>
  `
})
export default class RouteDetails {
  @Input() stops = []
  @Input() small = false
  @Input() distance = 0
  @Input() duration = 0
  @Input() background = 'bg-[#f6f6f6]'
  formatDuration = formatDuration
  formatDistance = formatDistance

  formatAddress(address: string) {
    return address.split(',').splice(0, 2).join(', ')
  }
}