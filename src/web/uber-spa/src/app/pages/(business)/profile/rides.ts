import { NgFor, NgStyle } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { userStore } from '@app/stores'
import trips from '@app/api/trips'
import TripDetails from '@app/components/common/tripDetails'
import routes from '@app/api/routes'

@Component({
  standalone: true,
  imports: [FormsModule, NgFor, TripDetails, NgStyle],
  template: `
    <div>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl">My Rides</h1>
        <select 
          [(ngModel)]="order" 
          (change)="getTrips()"
          class="w-[220px] cursor-pointer"
        >
          <option value="START_DESC">Newest Rides</option>
          <option value="START_ASC">Oldest Rides</option>
          <option value="PRICE_DESC">Most Expensive Rides</option>
          <option value="PRICE_ASC">Cheapest Rides</option>
        </select>
      </div>
      <div 
        [style.height]="window.shellHeight() - 108 + 'px'"
        class="mt-6 overflow-auto no-scrollbar overscroll-contain pb-16"
      >
        <div *ngFor="let trip of trips; trackBy: ngForIdentity;" class="mb-4">
          <TripDetails 
            [trip]="trip" 
            [canSaveRoute]="!savedRoutes[trip.route.id]"
            (requestReload)="getTrips()"
          >
          </TripDetails>
        </div>
      </div>
    </div>
  `
})
export default class Rides {

  window = window

  order = 'START_DESC'
  trips = []
  savedRoutes = {}
  reviews = {}

  constructor() {
    this.getTrips()
    userStore.user.role === 'ROLE_RIDER' && this.getSavedRoutes()
  }

  async getTrips() {
    try {
      this.trips = await trips.getTrips(userStore.user.id, this.order)
    }
    catch (e) {
      console.log(e.message)
    }
  }

  async getSavedRoutes() {
    try {
      this.savedRoutes = (await routes.favorites()).reduce((acc, route) => ({ ...acc, [route.id]: true }), {})
      console.log(this.savedRoutes)
    }
    catch (e) {
      console.log(e.message)
    }
  }

  routeSaved(routeId: number) {
    this.savedRoutes = { ...this.savedRoutes, [routeId]: true }
  }

  ngForIdentity = (index: number, item: any) => item.id

}
