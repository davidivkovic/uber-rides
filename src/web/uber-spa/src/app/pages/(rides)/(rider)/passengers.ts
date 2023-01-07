import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common'
import { watch } from 'usm-mobx'
import { createInfoWindow, createMarker, createPolyline, map, polylines, refreshAllElements, removeAllElements, subscribe } from '@app/api/google-maps'
import { ridesStore } from '@app/stores/ridesStore'
import { computed, formatDistance, formatDuration } from '@app/utils'
import PassengersStatus from '@app/components/rides/passengersStatus'
import RouteDetails from '@app/components/rides/routeDetails'
import DriverDetails from '@app/components/common/driverDetails'

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, PassengersStatus, RouteDetails, DriverDetails, CurrencyPipe],
  template: `
    <div *ngIf="ridesStore.data.trip || ridesStore.data.pickup" class="w-[400px] h-[700px] p-4 bg-white rounded-xl pointer-events-auto">
      <div *ngIf="!ridesStore.data.trip" class="flex flex-col">
        <h1 class="text-3xl pb-1">Ride overview</h1>
        <p class="text-zinc-700">You are currently not a passenger on any rides</p>
      </div>
      <div *ngIf="ridesStore.data.trip" class="flex flex-col h-full">
        <h1 class="text-3xl pb-3">Ride overview</h1>
        <RouteDetails 
          [stops]="stops()" 
          [distance]="ridesStore.data.trip.distanceInMeters"
          [duration]="ridesStore.data.trip.durationInSeconds"
        >
        </RouteDetails>
        <!-- <h3 class="mt-3 tracking-wide">Ride Details</h3> -->
        <div class="flex items-center bg-[#f6f6f6] rounded-md mt-3 py-2.5 mb-1 pr-3.5">
          <div class="relative -ml-1 ">
            <img [src]="ridesStore.data.trip.car.type.image" class="w-[100px] h-[100px] -mt-7" />
            <h3 
              *ngIf="ridesStore.data.trip.car.registration"
              class="absolute -bottom-2 left-3 text-[13px] tracking-wide px-1.5 py-[0.5px] rounded-sm ring-[1.35px] ring-black"
            >
              {{ ridesStore.data.trip.car.registration.replace('-', ' • ') }}
            </h3>
          </div>
          <div class="w-[120px] ml-1.5 mr-6">
            <div class="flex space-x-2 font-medium">
              <h3 class="text-xl w-min">{{ ridesStore.data.trip.car.type.name }}</h3>
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
                {{ ridesStore.data.trip.car.type.seats }}
              </div>
            </div>
            <p class="text-sm text-gray-500">{{ ridesStore.data.trip.car.type.description }}</p>
          </div>
          <div class="ml-auto text-right">
            <h3 class="text-[22px]">
              {{ ridesStore.data.trip.totalPrice / (ridesStore.data.trip.riders.length + 1) | currency:'USD' }}
            </h3>
            <p class="text-[13px] ml-0.5 -mt-1 mb-0.5 text-zinc-500">
              Per person
            </p>
            <p class="text-[13px] ml-0.5 -mt-1 text-zinc-500">Including tax</p>
          </div>
        </div>
        <PassengersStatus 
          [passengers]="ridesStore.data.trip.riders"
          [canRemove]="false"
          class="mt-3 pr-2"
        >
        </PassengersStatus>
      
        <div *ngIf="pickupPending || ridesStore.data.tripInProgress">
          <DriverDetails [driver]="ridesStore.data.trip.driver"></DriverDetails>
          <div *ngIf="!ridesStore.data.trip.canStart && !ridesStore.data.trip.canFinish">
            <h3 class="text-xl leading-5">{{ formatDistance(ridesStore.data?.pickup?.driverDistance) }}</h3>
            <p class="text-[15px] text-zinc-700">approx. {{ formatDuration(ridesStore.data?.pickup?.driverDuration) }}</p>
          </div>
          <div *ngIf="ridesStore.data?.pickup?.canStart && !ridesStore.data.tripInProgress">
            <h1 class="text-xl transition">The driver is at the pickup location</h1>
            <p class="text-zinc-500 text-[15px] -mt-0.5">Make yourself comfortable in the vehicle</p>
          </div>
          <div *ngIf="ridesStore.data.trip.canFinish">

          </div>
        </div>

        <button 
          *ngIf="(!ridesStore.data?.uberStatus || ridesStore.data?.uberStatus === 'NOT_LOOKING') && !pickupPending"
          class="secondary mt-auto pointer-events-none"
        >
          <div class="flex justify-center items-center">
            <svg *ngIf="true" class="animate-spin -ml-2 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-base">Waiting for ride owner</p>
          </div>
        </button>

        <button 
          *ngIf="ridesStore.data?.uberStatus === 'LOOKING' && !pickupPending"
          class="secondary !text-base mt-auto pointer-events-none"
        >
        <div 
          class="flex items-center"
          [ngClass]="{ 
            'justify-center': ridesStore.data.uberFound
          }"
        >
          <svg 
            *ngIf="!ridesStore.data.uberFound"
            class="animate-spin -ml-2 mr-2.5 h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="!ridesStore.data.uberFound">
            Looking for an {{ ridesStore.data.trip.car.type.name }}
          </span>
          <span *ngIf="ridesStore.data.uberFound">
            {{ uberFoundText }}
          </span>
          <svg 
            *ngIf="ridesStore.data.uberFound"
            class="animate-spin ml-2 -mr-2 h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="!ridesStore.data.uberFound" class="ml-auto -mr-1.5">
            {{ lookingDuration }}s
          </span>
        </div>
      </button>
      </div>
    </div>
  `
})
export default class Passengers {

  ridesStore = ridesStore
  lookingDuration = 1
  lookingInterval = null
  uberFoundText = 'Uber found. Please wait...'
  pickupPending = false

  ngAfterViewInit() {
    if (polylines.length === 0 || ridesStore.mapElements?.pickupPolyline?.getMap() !== map) refreshAllElements()
  }

  constructor(public router: Router) {
    watch(
      ridesStore,
      () => ridesStore.data.pickup,
      (curr, old) => {
        if (curr) {
          this.pickupPending = true
          ridesStore.setState(store => store.data.trip.riders.forEach(r => r.accepted = true))
        }
      }
    )
    const isMyTrip = ridesStore.data.directions != null
    if (isMyTrip) {
      this.pickupPending = true
      return
    }
    watch(
      ridesStore,
      () => ridesStore.data.uberStatus,
      (curr, old) => {
        if (curr === 'LOOKING') {
          this.lookingInterval = setInterval(() => {
            this.lookingDuration++
          }, 1000)
        }
        else {
          clearInterval(this.lookingInterval)
          this.lookingDuration = 1
        }
      }
    )
    watch(
      ridesStore,
      () => ridesStore.data.uberFound,
      (curr, old) => {
        if (!curr) return
        setTimeout(() => this.uberFoundText = 'Processing payment...', 1500)
        setTimeout(() => this.pickupPending = true, 3000)
      }
    )
  }

  stops = computed(
    () => ridesStore.data.trip,
    () => {
      const stops = [ridesStore.data.trip.route.start, ...ridesStore.data.trip.route.stops]
      const isMyTrip = ridesStore.data.directions != null
      if (!isMyTrip) {
        if (map) {
          this.drawPolyline(stops)
        }
        else {
          subscribe(() => this.drawPolyline(stops))
        }
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

  drawPolyline(stops: any[], removeElements = true) {
    removeElements && removeAllElements()
    createPolyline(ridesStore.data.trip.route.encodedPolyline)
    stops.forEach((stop, index) => {
      createMarker(stop.latitude, stop.longitude, index == stops.length - 1)
      createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
    })

    map.fitBounds(new google.maps.LatLngBounds(
      {
        lat: ridesStore.data.trip.route.swBounds.latitude,
        lng: ridesStore.data.trip.route.swBounds.longitude
      },
      {
        lat: ridesStore.data.trip.route.neBounds.latitude,
        lng: ridesStore.data.trip.route.neBounds.longitude
      })
    )
    map.panBy(-180, 0)
  }

}