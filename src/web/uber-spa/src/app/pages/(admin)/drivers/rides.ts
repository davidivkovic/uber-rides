import { NgFor, NgIf, NgStyle } from '@angular/common'
import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import trips from '@app/api/trips'
import TripDetails from '@app/components/common/tripDetails'

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, TripDetails, NgStyle],
  template: `
    <div class="max-w-[800px]">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl">{{ userFirstName }}'s Rides</h1>
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
        <div *ngIf="currentTrip" class="mb-4">
          <TripDetails 
            [trip]="currentTrip" 
            [canSaveRoute]="false"
            [canRideAgain]="false"
          >
          </TripDetails>
        </div>
        <div *ngFor="let trip of trips; trackBy: ngForIdentity;" class="mb-4">
          <TripDetails 
            [trip]="trip" 
            [canSaveRoute]="false"
            [canRideAgain]="false"
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
  currentTrip: any
  savedRoutes = {}
  userId: any
  userFirstName: any

  constructor(public route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => this.userId = Number(params.get('id')))
    this.route.queryParamMap.subscribe(params => this.userFirstName = params.get('name'))
  }

  ngOnInit() {
    this.getTrips()
  }

  async getTrips() {
    if (!this.userId) return
    try {
      this.trips = await trips.getTrips(this.userId, this.order)
    }
    catch (e) {
      console.log(e.message)
    }
  }

  ngForIdentity = (index: number, item: any) => item.id

}
