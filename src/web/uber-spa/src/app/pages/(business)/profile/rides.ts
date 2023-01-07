import { NgFor } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { userStore } from '@app/stores'
import trips from '@app/api/trips'

@Component({
  standalone: true,
  imports: [FormsModule, NgFor],
  template: `
    <div>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl">Your Rides</h1>
        <select 
          [(ngModel)]="order" 
          (change)="getTrips()"
          class="w-[220px] cursor-pointer"
        >
          <option value="START_DESC">Newest Trips</option>
          <option value="START_ASC">Oldest Trips</option>
          <option value="PRICE_DESC">Most Expensive Trips</option>
          <option value="PRICE_ASC">Cheapest Trips</option>
        </select>
      </div>
      <div *ngFor="let trip of trips">
        <p>{{ trip.startedAt }}</p>
      </div>
    </div>
  `
})
export default class Rides {
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

}
