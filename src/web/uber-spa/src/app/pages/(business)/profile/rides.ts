import { NgFor, NgStyle } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { userStore } from '@app/stores'
import trips from '@app/api/trips'
import TripDetails from '@app/components/common/tripDetails'

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
        [style.height]="window.shellHeight() - 165 + 'px'"
        class="mt-6 overflow-auto no-scrollbar"
      >
        <div *ngFor="let trip of trips; trackBy: ngForIdentity;" class="mb-4">
          <TripDetails [trip]="trip"></TripDetails>
        </div>
      </div>
    </div>
  `
})
export default class Rides {

  window = window

  order = 'START_DESC'
  trips = []

  constructor() {
    this.getTrips()
  }

  async getTrips() {
    try {
      this.trips = await trips.getTrips(userStore.user.id, this.order)
    }
    catch (e) {
      console.log(e.message)
    }
  }

  ngForIdentity = (index: number, item: any) => item.id

}
