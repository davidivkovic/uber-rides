import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { ridesStore } from '@app/stores/ridesStore'
import { formatDuration, formatDistance, computed } from '@app/utils'
import PassengersStatus from '@app/components/rides/passengersStatus'
import RouteDetails from '@app/components/rides/routeDetails'
import StatusBar from './components/statusBar'
import Navigation from './components/navigation'
import { map, polylines, refreshAllElements, subscribe } from '@app/api/google-maps'
import trips from '@app/api/trips'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, StatusBar, Navigation, PassengersStatus, RouteDetails],
  template: `
    <div class="flex flex-col h-[700px] w-[400px] p-4 bg-white pointer-events-auto rounded-xl overflow-y-clip">
      <StatusBar></StatusBar>
      <h1 class="text-xl leading-10 transition mt-1">Ride overview</h1>
      <div *ngIf="ridesStore.data.trip">
        <div class="mb-1.5">
          <RouteDetails 
            [stops]="stops()" 
            [distance]="ridesStore.data.trip.distanceInMeters"
            [duration]="ridesStore.data.trip.durationInSeconds"
          >
          </RouteDetails>
        </div>
        <PassengersStatus 
          [passengers]="ridesStore.data.trip.riders"
          [canRemove]="false"
        >
        </PassengersStatus>
      </div>
      <div *ngIf="ridesStore.data?.trip" class="mt-1">
        <h1 class="text-xl leading-[44px] transition">Head to the next stop</h1>
        <p class="text-zinc-500 text-[15px] -mt-2.5">The ride will finish once you arrive at the destination</p>
        <div>
          <h3 class="text-xl leading-5">{{ formatDistance(ridesStore.data?.pickup?.driverDistance) }}</h3>
          <p class="text-[15px] text-zinc-700">approx. {{ formatDuration(ridesStore.data?.pickup?.driverDuration) }}</p>
        </div>
        <Navigation class="mt-2"></Navigation>
      </div>
      <!-- <div class="mt-auto flex flex-col gap-y-1">
        <button 
          *ngIf="ridesStore.data.trip.canFinish" 
          class="primary"
        >
          Finish Ride
        </button>
      </div> -->
    </div>
  `
})
export default class Drive {
  ridesStore = ridesStore
  formatDuration = formatDuration
  formatDistance = formatDistance

  startTrip() {
    try {
      trips.startTrip()
    }
    catch (e) {
      console.error(e.message)
    }
  }

  formatAddress(address: string) {
    return address.split(',').splice(0, 2).join(', ')
  }

  stops = computed(
    () => ridesStore.data.pickup,
    () => [ridesStore.data.pickup.trip.route.start, ...ridesStore.data.pickup.trip.route.stops]
  )

  ngAfterViewInit() {
    // subscribe(() => {
    //   if (ridesStore.data.pickup && (ridesStore.mapElements?.pickupPolyline?.getMap() !== map)) {
    //     ridesStore.mapElements.pickupPolyline?.setMap(map)
    //     ridesStore.mapElements.pickupMarkers?.forEach(m => m.setMap(map))
    //   }
    // })
    console.log(polylines.length)
    if (polylines.length === 0 || polylines[0]?.getMap() !== map) refreshAllElements()
  }
}