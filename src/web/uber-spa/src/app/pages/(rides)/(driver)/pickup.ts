import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { ridesStore } from '@app/stores/ridesStore'
import { formatDuration, formatDistance, computed } from '@app/utils'
import PassengersStatus from '@app/components/rides/passengersStatus'
import RouteDetails from '@app/components/rides/routeDetails'
import StatusBar from './components/statusBar'
import Navigation from './components/navigation'
import { map, subscribe } from '@app/api/google-maps'
import trips from '@app/api/trips'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, StatusBar, Navigation, PassengersStatus, RouteDetails],
  template: `
    <div class="flex flex-col h-[700px] w-[400px] p-4 bg-white pointer-events-auto rounded-xl overflow-y-clip">
      <StatusBar></StatusBar>
      <h1 class="text-xl leading-10 transition mt-1">Ride overview</h1>
      <div *ngIf="ridesStore.state.pickup" class="">
        <div class="mb-1.5">
          <RouteDetails 
            [stops]="stops()" 
            [distance]="ridesStore.state.pickup.trip.distanceInMeters"
            [duration]="ridesStore.state.pickup.trip.durationInSeconds"
          >
          </RouteDetails>
        </div>
        <PassengersStatus 
          [passengers]="ridesStore.state.pickup.trip.riders"
          [canRemove]="false"
        >
        </PassengersStatus>
      </div>
      <div *ngIf="!ridesStore.state?.pickup?.canStart">
        <h1 class="text-xl leading-5 transition mt-1.5">Head to the pickup location</h1>
        <p class="text-zinc-500 text-[15px]">You will be able to start the ride once you arrive</p>
      </div>
      <div *ngIf="ridesStore.state?.pickup?.canStart">
        <h1 class="text-xl leading-[44px] transition">You are at the pickup location</h1>
        <p class="text-zinc-500 text-[15px] -mt-2.5">Please pick up a passenger and start the ride</p>
      </div>
      <div *ngIf="!ridesStore.state?.pickup?.canStart" class="mt-1 flex gap-x-1">
        <div>
          <h3 class="text-xl leading-5">{{ formatDistance(ridesStore.state?.pickup?.driverDistance) }}</h3>
          <p class="text-[15px] text-zinc-700">approx. {{ formatDuration(ridesStore.state?.pickup?.driverDuration) }}</p>
        </div>
        <Navigation></Navigation>
      </div>
      <div class="mt-auto flex flex-col gap-y-1">
        <button 
          *ngIf="ridesStore.state?.pickup?.canStart" 
          (click)="startTrip()"
          class="primary"
        >
          Start Ride
        </button>
        <button class="secondary">Cancel Ride</button>
      </div>
    </div>
  `
})
export default class Pickup {
  ridesStore = ridesStore
  formatDuration = formatDuration
  formatDistance = formatDistance

  constructor(public router: Router) { }

  async startTrip() {
    try {
      await trips.startTrip()
      this.router.navigate(['/drive'])

    }
    catch (e) {
      console.error(e.message)
    }
  }

  formatAddress(address: string) {
    return address.split(',').splice(0, 2).join(', ')
  }

  stops = computed(
    () => ridesStore.state.pickup,
    () => [ridesStore.state.pickup.trip.route.start, ...ridesStore.state.pickup.trip.route.stops]
  )

  ngAfterViewInit() {
    subscribe(() => {
      if (ridesStore.state.pickup && (ridesStore.state?.pickupPolyline?.getMap() !== map)) {
        ridesStore.state.pickupPolyline.setMap(map)
        ridesStore.state.pickupMarker.setMap(map)
      }
    })
  }
}