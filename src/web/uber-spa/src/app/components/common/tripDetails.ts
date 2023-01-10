import { NgClass, CurrencyPipe, NgIf } from '@angular/common'
import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import dayjs from 'dayjs'
import { computed, formatDistance, formatDuration, InnerHtml } from '@app/utils'
import RouteDetails from '@app/components/rides/routeDetails'
import DriverDetails from '@app/components/common/driverDetails'

@Component({
  selector: 'TripDetails',
  standalone: true,
  imports: [NgIf, NgClass, InnerHtml, RouteDetails, DriverDetails, CurrencyPipe],
  template: `
    <div #root class="cursor-pointer px-5 py-2.5 border rounded-md" (click)="expandTrip()">
      <div class="flex items-center justify-between pb-2">
        <h3 class="text-lg">{{ trip.status === 'COMPLETED' ? 'Finished' : 'Scheduled' }}</h3>
        <h3 class="text-sm tracking-wide">{{ dayjs(trip.startedAt).format(' hh:mm MMM D, YYYY') }}</h3>
      </div>
      <div class="flex gap-x-0.5">
        <img 
          [src]="trip.route.thumbnail" 
          [ngClass]="{ 'h-[110px]': !expanded, 'h-[220px]': expanded }"
          class="object-contain rounded-lg transition-all duration-200 ease-in-out"
        />
        <div class="-mt-2.5">
          <!-- <h3 class="text-lg ml-[26px] -mt-6">Route</h3> -->
          <RouteDetails 
            [stops]="stops()" 
            [small]="true" 
            background="bg-transparent"
            class=""
          >
          </RouteDetails>
          <div class="ml-6 -mt-1 flex items-center gap-x-1">
            <h3 class="leading-5">{{ formatDistance(trip.distanceInMeters) }}</h3>
            <p class="text-sm text-gray-500">approx. {{ formatDuration(trip.durationInSeconds) }}</p>
          </div>
        </div>
        <div class="text-center ml-auto ">
          <!-- <p class="text-[13px] ml-0.5 -mb-1 text-zinc-500">You Paid</p> -->
          <div [title]="trip.car.type.name">
              <img [src]="trip.car.type.image" class="w-[55px] ml-3.5"/>
              <h3 class="w-fit text-[12px] tracking-wide px-1.5 py-[0.5px] rounded-sm bg-[#eeeeee] -mt-2.5 whitespace-nowrap">
                {{ trip.car.registration.replace('-', ' • ') }}
              </h3>
            </div>
          <h3 class="text-[18px]">
            {{ trip.totalPrice | currency:'USD'}}
          </h3>
          <!-- <p 
            class="text-[13px] ml-0.5 -mt-1 mb-0.5 text-zinc-500"
          >
            Per person
          </p> -->
        </div>
      </div>
      <div *ngIf="expanded" class="pt-3.5">
         <h3 class="pb-1">Driver</h3>
         <div class="flex items-center gap-x-3">
            <!-- <div [title]="trip.car.type.name">
              <img [src]="trip.car.type.image" class="w-[55px] -mt-2 ml-2.5"/>
              <h3 class="w-fit text-[12px] tracking-wide px-1.5 py-[0.5px] rounded-sm bg-[#eeeeee] -mt-2.5">
                {{ trip.car.registration.replace('-', ' • ') }}
              </h3>
            </div> -->
            <DriverDetails [driver]="trip.driver"></DriverDetails>
          </div>
      </div>
      <div class="flex justify-end">
        <button class="flex gap-x-2 p-0">
          <p class="-mt-px">Details</p>
          <div [innerHTML]="(expanded ? icons.chevronUp : icons.chevronDown) | innerHTML"></div>
        </button>
      </div>
    </div>
  `
})
export default class TripDetails {

  dayjs = dayjs
  icons = icons
  formatDistance = formatDistance
  formatDuration = formatDuration

  @Input() trip: any
  @ViewChild('root') root: ElementRef<HTMLDivElement>
  expanded = true

  stops = computed(
    () => this.trip,
    () => {
      if (this.expanded) return [this.trip.route.start, ...this.trip.route.stops]
      return [this.trip.route.start, this.trip.route.stops[this.trip.route.stops.length - 1]]
    }
  )

  expandTrip() {
    this.expanded = !this.expanded
    // this.expanded && setTimeout(
    //   () => this.root.nativeElement.scrollIntoView({ behavior: 'smooth' }),
    //   300
    // )
  }

}

const icons = {
  chevronUp: `
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-up" width="20" height="20" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <polyline points="6 15 12 9 18 15"></polyline>
    </svg>
  `,
  chevronDown: `
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-down" width="20" height="20" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `
}