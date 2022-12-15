import { Component } from '@angular/core'
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common'
import { ridesStore } from '@app/stores/ridesStore'
import { computed, formatDistance, formatDuration } from '@app/utils'
import PassengersStatus from '@app/components/rides/passengersStatus'
import { createInfoWindow, createMarker, createPolyline, map, removeAllElements, subscribe } from '@app/api/google-maps'

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, PassengersStatus, CurrencyPipe],
  template: `
    <div class="w-[400px] h-[700px] p-4 bg-white rounded-xl pointer-events-auto">
      <div *ngIf="!ridesStore.state?.trip" class="flex flex-col">
        <h1 class="text-3xl pb-1">Trip overview</h1>
        <p class="text-zinc-700">You are currently not a passenger on any rides</p>
      </div>
      <div *ngIf="ridesStore.state?.trip" class="flex flex-col h-full">
        <h1 class="text-3xl pb-3">Trip overview</h1>
        <div class="relative px-1 pb-2.5 rounded-md bg-[#f6f6f6] pl-3 pt-2">
          <div *ngFor="let stop of stops(); index as index;">
            <div class="pl-7 w-full">
              <p class="text-zinc-500 text-[15px] -mb-1.5 -mt-0.5">
                {{ index == 0 ? 'From' : index < stops().length - 1 ? 'Stop' : 'To' }}
              </p>
              <h3 class="text-lg tracking-wide">
                {{ formatAddress(stop.address) }}
              </h3>
            </div>
            <div class="absolute -mt-[18px] ml-1.5 z-10">
              <div 
                class="w-1.5 h-1.5 border-2 border-black"
                [ngClass]="{ 'rounded-full' : index !== stops().length - 1 }"
              >
              </div>
              <div 
                *ngIf="index !== stops().length - 1" 
                class="w-[2px] h-7 ml-[2px] my-[5px] bg-black"
              >
              </div>
            </div>
          </div>
          <div class="absolute right-3 bottom-3.5 text-right z-10">
            <h3 class="text-xl leading-5 mt-0.5">{{ formatDistance(ridesStore.state.trip.distanceInMeters) }}</h3>
            <p class="text-sm text-zinc-700">approx. {{ formatDuration(ridesStore.state.trip.durationInSeconds) }}</p>
          </div>
        </div>
        <!-- <h3 class="mt-3 tracking-wide">Ride Details</h3> -->
        <div class="flex items-center bg-[#f6f6f6] rounded-md mt-3 mb-1 pr-3.5">
          <img [src]="ridesStore.state.trip.car.type.image" class="-ml-1 w-[100px] h-[100px]" />
          <div class="w-[120px] ml-1.5 mr-6">
            <div class="flex space-x-2 font-medium">
              <h3 class="text-xl w-min">{{ ridesStore.state.trip.car.type.name }}</h3>
              <div class="flex items-center font-medium">
                <svg class="mb-0.5 mr-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <title>Person</title>
                  <path 
                    fill-rule="evenodd" 
                    clip-rule="evenodd" 
                    d="M17.5 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zM3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6v3H3v-3z" 
                    fill="currentColor"
                    >
                  </path>
                </svg>
                {{ ridesStore.state.trip.car.type.seats }}
              </div>
            </div>
            <p class="text-sm text-gray-500">{{ ridesStore.state.trip.car.type.description }}</p>
          </div>
          <div class="ml-auto text-right">
            <h3 class="text-[22px]">
              {{ ridesStore.state.trip.totalPrice / (ridesStore.state.trip.riders.length + 1) | currency:'USD' }}
            </h3>
            <p class="text-[13px] ml-0.5 -mt-1 mb-0.5 text-zinc-500">
              Per person
            </p>
            <p class="text-[13px] ml-0.5 -mt-1 text-zinc-500">Including tax</p>
          </div>
        </div>
        <PassengersStatus 
          [passengers]="ridesStore.state.trip.riders"
          [canRemove]="false"
          class="mt-3 pr-2"
        >
        </PassengersStatus>
        <button class="secondary mt-auto pointer-events-none">
          <div class="flex justify-center items-center">
            <svg *ngIf="true" class="animate-spin -ml-2 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-base">Waiting for ride owner</p>
          </div>
        </button>
      </div>
    </div>
  `
})
export default class Passengers {

  ridesStore = ridesStore

  stops = computed(
    () => ridesStore.state.trip,
    () => {
      const stops = [ridesStore.state.trip.route.start, ...ridesStore.state.trip.route.stops]
      if (map) {
        this.drawPolyline(stops)
      }
      else {
        subscribe(() => this.drawPolyline(stops))
      }
      return stops ?? []
    }
  )

  formatDistance(distance: number) {
    return formatDistance(distance)
  }

  formatDuration(duration: number) {
    return formatDuration(duration)
  }

  formatAddress(address: string) {
    return address.split(',').splice(0, 2).join(', ')
  }

  drawPolyline(stops: any[]) {
    removeAllElements()
    createPolyline(ridesStore.state.trip.route.encodedPolyline)
    stops.forEach((stop, index) => {
      createMarker(stop.latitude, stop.longitude, index == stops.length - 1)
      createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
    })

    map.fitBounds(new google.maps.LatLngBounds(
      {
        lat: ridesStore.state.trip.route.swBounds.latitude,
        lng: ridesStore.state.trip.route.swBounds.longitude
      },
      {
        lat: ridesStore.state.trip.route.neBounds.latitude,
        lng: ridesStore.state.trip.route.neBounds.longitude
      })
    )
    map.panBy(-180, 0)
  }

}