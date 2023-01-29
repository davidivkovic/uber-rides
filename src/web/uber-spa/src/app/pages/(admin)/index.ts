import { Unsubscribe, watch } from 'usm-mobx'
import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterOutlet } from '@angular/router'
import { createInfoWindow, createMarker, createPolyline, init, map, removeAllElements } from '@app/api/google-maps'
import cars from '@app/api/cars'
import trips from '@app/api/trips'
import users from '@app/api/users'
import { PFP } from '@app/utils'
import { ridesStore } from '@app/stores'
import DriverDetails from '@app/components/common/driverDetails'
import { centerOnDriver, findDriverLocation, shortenPickupPolyline } from '@app/api/ws-messages/carLocation'
import RouteDetails from '@app/components/rides/routeDetails'
import PassengersStatus from '@app/components/rides/passengersStatus'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterOutlet, DriverDetails, PFP, RouteDetails, PassengersStatus],
  template: `
    <div class="h-full relative">
      <div id="google-map-container" class="absolute w-full h-full">
        <div id="google-map" class="absolute w-full h-full"></div>
        <div id="google-map-overlay" class="absolute w-full h-full pointer-events-none"></div>
      </div>
      <div class="h-full w-full absolute z-10 pointer-events-none">
        <div class="max-w-7xl mx-auto w-full h-full flex items-center px-4">
          <div class="flex flex-col h-[700px] w-[400px] p-4 bg-white pointer-events-auto rounded-xl overflow-y-clip">
            <h1 class="text-3xl">Active Ubers</h1>
            <p class="text-zinc-600 text-[15px]">Select a car form the map or search for drivers</p>
            <div class="mt-2 mb-2 relative">
              <svg class="absolute left-3 w-5 h-full" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
              <input
                type="text"
                autocomplete="off"
                spellcheck="false"
                placeholder="Search for active drivers"
                [(ngModel)]="query"
                (input)="queryChanged()"
                (focus)="inputFocused = true"
                (blur)="inputFocused = false; query = ''; drivers = []"
                class="pl-10 mt-1"
              />
              <ul 
                role="listbox"
                class="w-full max-h-[400px] z-50 mt-2 bg-white border border-zinc-300 shadow-lg overflow-y-auto rounded-md" 
                [ngClass]="inputFocused && drivers.length ? 'absolute' : 'hidden'"
              >
                <li 
                  role="option"
                  *ngFor="let driver of drivers; trackBy: ngForIdentity; index as index"
                  (mousedown)="focusDriver(driver, $event)"
                  class="hover:bg-zinc-200 cursor-pointer p-3"
                  [class]="{ 
                    '!pb-3.5' : index === drivers.length - 1,
                    '!pt-3.5' : index === 0 
                  }"
                >
                  <div class="flex items-center space-x-3">
                    <img [src]="driver.profilePicture | PFP" class="w-9 h-9 rounded-full object-cover"/>
                    <div>
                      <p class="leading-4">{{ driver.firstName}} {{ driver.lastName }}</p>
                      <p class="text-sm text-zinc-600">{{ driver.email }}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div *ngIf="!ridesStore.data?.trip?.driver" class="my-auto text-center">
              <h3 class="text-xl -mt-8">You are currently not onboard</h3>
              <p class="text-sm text-zinc-500 -mt-0.5">Start tracking a driver by selecting a car</p>
            </div>
            <div *ngIf="ridesStore.data?.trip?.driver" class="flex flex-col h-full">
              <h3 class="mb-1.5 text-[15px] tracking-wide">Onboard with</h3>
              <div class="flex items-center gap-x-2.5">
                <DriverDetails 
                  [large]="true"
                  [driver]="ridesStore.data.trip.driver"
                >
                </DriverDetails>
                <div>
                  <div class="flex items-end gap-x-2">
                    <div class="h-8 w-3 mb-px bg-[#eeeeee] rounded flex flex-col overflow-clip">
                      <div class="h-[55%] w-full mt-auto rounded bg-green-500 flex items-center justify-center relative">
                        <svg viewBox="0 0 20 20" fill="currentColor" class="absolute w-2 h-2 text-white">
                          <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-[15px] leading-4 tracking-wide">2 Hours</h3>
                      <p class="text-[13px] text-zinc-500 -mb-0.5">Drive time left</p>
                    </div>
                  </div>
                </div>
              </div>
              <p *ngIf="!ridesStore.data.trip?.id" class="text-[15px] mt-2 text-zinc-600">
                This driver is currently not on a ride.
              </p>
              <div *ngIf="ridesStore.data.trip?.id" class="mt-1.5">
                <h3 class="mb-1 text-[15px] tracking-wide">Current trip</h3>
                <RouteDetails 
                  [stops]="ridesStore.data.trip.stops" 
                  [distance]="ridesStore.data.trip.distanceInMeters"
                  [duration]="ridesStore.data.trip.durationInSeconds"
                  [small]="true"
                >
                </RouteDetails>
                <div class="mt-1">
                  <PassengersStatus 
                    [passengers]="ridesStore.data.trip.riders"
                    [canRemove]="false"
                    [overrideOnline]="true"
                  >
                  </PassengersStatus>
                </div>
              </div>
              <button (click)="clearCurrentTrip()" class="secondary w-full mt-auto">
                Leave onboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export default class Index {

  ridesStore = ridesStore
  unsubscribe: Unsubscribe
  query = ''
  drivers = []
  inputFocused = false
  loading = false

  constructor() {
    cars.pollLiveLocations()
    this.unsubscribe = watch(
      ridesStore,
      () => ridesStore.data.followDriverId,
      () => !this.loading && this.getCurrentTrip(ridesStore.data.followDriverId)
    )
    watch(
      ridesStore,
      () => ridesStore.data?.trip?.canFinish,
      (curr, prev) => {
        if (!curr) return
        ridesStore.setState(store => store.data.trip.canFinish = false)
        this.getCurrentTrip(ridesStore.data.followDriverId, false)
      }
    )
  }

  ngAfterViewInit() {
    init('google-map')
  }

  async queryChanged() {
    this.drivers = await users.getDrivers(0, 'ACTIVE', this.query)
  }

  async focusDriver(driver: any, event: any) {
    event.preventDefault()
    this.loading = true
    this.query = ''
    this.drivers = []
    ridesStore.setState(store => {
      if (map.getZoom() !== 17) store.data.previousZoom = map.getZoom()
      store.data.followCarRegistration = driver.car.registration
      store.data.followDriverId = driver.id
    })
    centerOnDriver(driver)
    await this.getCurrentTrip(driver.id)
    this.loading = false
  }

  async getCurrentTrip(driverId: number, shortenPolyline = true) {
    if (!driverId) return
    try {
      const trip = await trips.getCurrentTrip(driverId)
      ridesStore.setState(store => {
        store.data.trip = trip
        if (trip.route) store.data.trip.stops = [trip.route.start, ...trip.route.stops]
      })
      if (trip.pickupDirections) {
        const pickupPolyline = createPolyline(trip.pickupDirections.routes[0].overviewPolyline.encodedPath, '#FFFFFF00', 'pickup')
        ridesStore.setMapElements()
        if (shortenPolyline) {
          shortenPickupPolyline(findDriverLocation(trip.driver), 0, 0)
          pickupPolyline.setOptions({ strokeColor: '#000000' })
        }
        // cars.pollLiveLocations().then(() => pickupPolyline.setOptions({ strokeColor: '#000000' }))
      }
      if (trip.route?.encodedPolyline) {
        const stops = [trip.route.start, ...trip.route.stops]
        stops.map((stop, index) => {
          createMarker(stop.latitude, stop.longitude, index === stops.length - 1, 'route')
          createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
        })
        createPolyline(trip.route.encodedPolyline, '#000000', 'route')
        shortenPolyline && shortenPickupPolyline(findDriverLocation(trip.driver), 0, 0)
      }
      if (!trip.id) {
        removeAllElements()
        ridesStore.setMapElements()
      }
    }
    catch (error) {
      console.log(error)
      this.clearCurrentTrip()
      this.loading = false
    }
  }

  clearCurrentTrip() {
    ridesStore.setState(store => {
      store.data.trip = null
      store.data.followDriverId = null
      store.data.followCarRegistration = null
    })
    map.setZoom(ridesStore.data.previousZoom)
    removeAllElements()
  }

  ngForIdentity = (index: number, item: any) => item.id

  ngOnDestroy() {
    this.unsubscribe?.()
  }
}