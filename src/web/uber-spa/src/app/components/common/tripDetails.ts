import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { watch } from 'usm-mobx'
import { NgClass, CurrencyPipe, NgIf, NgFor } from '@angular/common'
import { Component, ElementRef, Input, ViewChild, EventEmitter, Output } from '@angular/core'
import { computed, formatDistance, formatDuration, InnerHtml } from '@app/utils'
import { dialogStore, notificationStore, ridesStore, userStore } from '@app/stores'
import RouteDetails from '@app/components/rides/routeDetails'
import DriverDetails from '@app/components/common/driverDetails'
import routes from '@app/api/routes'

dayjs.extend(utc)
dayjs.extend(tz)

@Component({
  selector: 'TripDetails',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, InnerHtml, RouteDetails, DriverDetails, CurrencyPipe],
  template: `
    <div #root class="cursor-pointer px-5 py-2.5 border rounded-md" (click)="expandTrip()">
      <div class="flex items-center justify-between pb-2">
        <div class="flex items-center gap-x-2">
          <h3 class="text-lg">
            {{ 
              (trip.status === 'PAID' && trip.scheduled) 
              ? statuses['SCHEDULED'] 
              : (statuses[trip.status] ?? 'Finished') 
            }}
          </h3>
          <div 
            *ngIf="trip.status === 'AWAITING_PICKUP' || trip.status === 'IN_PROGRESS'"
            class="w-2 h-2 mx-auto rounded-full bg-green-500"
          >
          </div>
        </div>
        <h3 class="text-sm tracking-wide"> {{ formattedDate() }} </h3>
      </div>
      <div class="flex gap-x-0.5">
        <img 
          [src]="trip.route.thumbnail" 
          [ngClass]="{ 'h-[110px]': !expanded, 'h-[170px]': expanded }"
          class="object-contain rounded-lg"
        />
        <div class="-mt-2.5">
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
        <div class="ml-auto flex flex-col text-center">
          <div class="mt-6" [ngClass]="{ 'mr-1': expanded && userStore.user.role === 'ROLE_RIDER' }">
            <p class="text-[13px] ml-0.5 text-zinc-500">Total Price</p>
            <h3 class="text-xl">
              {{ trip.totalPrice | currency:'USD'}}
            </h3>
          </div>
          <div 
            *ngIf="expanded && userStore.user.role === 'ROLE_RIDER'" 
            class="whitespace-nowrap mt-5"
          >
            <button 
              (click)="saveRoute(); $event.stopPropagation()" 
              *ngIf="canSaveRoute && trip.status === 'COMPLETED'"
              class="flex w-full secondary !text-sm px-7 py-2 mb-1"
            >
              <svg class="mr-1.5 -ml-2" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="6" cy="19" r="2"></circle>
                <circle cx="18" cy="5" r="2"></circle>
                <path d="M12 19h4.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h3.5"></path>
              </svg>
              <span>Save Route</span>
            </button>
            <button 
              (click)="rideAgain(); $event.stopPropagation()" 
              *ngIf="canRideAgain && trip.status === 'COMPLETED' && !ridesStore.data?.trip?.id"
              class="flex w-full primary !text-sm px-7 py-2"
            >
              <svg class="mr-1.5 -ml-2" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1.002 7.935 1.007 9.425 4.747"></path>
                <path d="M20 4v5h-5"></path>
              </svg>
              <span>Ride Again</span>
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="expanded" class="relative pt-3.5">
        <h3 class="pb-1">Driver & Vehicle</h3>
        <div class="flex items-center">
          <DriverDetails [driver]="trip.driver"></DriverDetails>
          <div [title]="trip.car.type.name" class="flex items-center -mt-[18px]">
            <div class="w-px h-11 bg-neutral-200 mx-3 mt-5"></div>
            <div>
              <img [src]="trip.car.type.image" class="w-[55px] ml-3"/>
              <h3 class="-mt-4 w-fit text-[12px] tracking-wide px-1.5 py-[0.5px] rounded bg-[#eeeeee] whitespace-nowrap">
                {{ trip.car.registration.replace('-', ' • ') }}
              </h3>
            </div>
          </div>
          </div>
          <h3 class="pt-3 pb-1">Passengers</h3>
          <div *ngFor="let rider of trip.riders" class="max-w-[70%] pb-3.5">
            <div class="flex items-start gap-x-3 mt-2">
              <img [src]="rider.profilePicture" class="w-11 h-11 rounded-full object-cover -mt-1"/>
              <div class="whitespace-nowrap">
                <h3 class="flex-1 leading-4 text-[15px]">{{ rider.firstName}} {{ rider.lastName }}</h3>
                <p class="text-[13px]">{{ trip.driver.phoneNumber }}</p>
              </div>
              <div 
                *ngIf="((userStore.user.id === rider.id && reviewExpiration() <= 3) || reviews()[rider.id]) && trip.status === 'COMPLETED'"
                class="w-px h-11 bg-neutral-200 -mt-0.5"
              >
              </div>
              <div *ngIf="reviews()[rider.id]" class="-mt-0.5">
                <div class="flex items-center gap-x-0.5">
                  <h3 class="text-sm ml-0.5">Rating</h3>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm">{{ reviews()[rider.id].rating }}/5</p>
                </div>
                <p class="text-sm italic -mt-0.5 text-neutral-600">
                  {{ reviews()[rider.id].comment }}
                </p>
              </div>
              <p 
                *ngIf="!reviews()[rider.id] && userStore.user.id !== rider.id" 
                class="mt-2 text-sm text-neutral-600"
              >
                This passenger has not left a review
              </p>
              <div 
                *ngIf="!reviews()[rider.id] && userStore.user.id === rider.id && reviewExpiration() <= 3 && trip.status === 'COMPLETED'" 
                class="-mt-0.5"
              >
                <button 
                  (click)="leaveReview(); $event.stopPropagation();"
                  class="secondary flex items-center -mb-0.5 gap-x-1 px-2.5 py-1 rounded !text-[13px]"
                >
                  Leave a Review
                </button>
                <span class="text-xs text-gray-600">
                  You have {{ reviewExpiration() }} 
                  more {{reviewExpiration() === 1 ? 'day' : 'days'}} 
                  to leave a review
                </span>
              </div>
            </div>
          </div>
      </div>
      <div class="flex justify-end" [ngClass]="{ 'pt-4': expanded }">
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
  userStore = userStore
  ridesStore = ridesStore
  formatDistance = formatDistance
  formatDuration = formatDuration

  @Input() trip: any
  @Input() canSaveRoute = true
  @Input() canRideAgain = true
  @Output() routeSaved = new EventEmitter<number>()
  @Output() requestReload = new EventEmitter()
  @ViewChild('root') root: ElementRef<HTMLDivElement>
  expanded = false

  statuses = {
    COMPLETED: 'Finished',
    CANCELLED: 'Cancelled',
    IN_PROGRESS: 'In Progress',
    AWAITING_PICKUP: 'In Progress',
    SCHEDULED: 'Scheduled',
    PAID: 'Paid',
  }

  formattedDate = computed(
    () => this.trip,
    () => {
      return (this.trip.status === 'COMPLETED')
        ? dayjs.utc(this.trip.startedAt).tz('Europe/Belgrade').format(' hh:mm MMM D, YYYY')
        : (
          (this.trip.status === 'SCHEDULED' || this.trip.status === 'PAID')
            ? dayjs.utc(this.trip.scheduledAt).tz('Europe/Belgrade').format(' hh:mm MMM D, YYYY')
            : 'Just Now'
        )
    }
  )

  stops = computed(
    [() => this.trip, () => this.expanded],
    () => {
      if (!this.trip) return []
      if (this.expanded) return [this.trip.route.start, ...this.trip.route.stops]
      return [this.trip.route.start, this.trip.route.stops[this.trip.route.stops.length - 1]]
    }
  )

  reviews = computed(
    () => this.trip,
    () => {
      if (!this.trip) return {}
      return this.trip.ratings.reduce((acc, review) => ({ ...acc, [review.userId]: review }), {})
    }
  )

  reviewExpiration = computed(
    () => this.trip,
    () => {
      if (!this.trip) return 0
      return dayjs().add(3, 'days').diff(dayjs(this.trip.startedAt), 'days')
    }

  )

  expandTrip() {
    this.expanded = !this.expanded
    // this.expanded && setTimeout(() => this.root.nativeElement.scrollIntoView({ behavior: 'smooth' }), 0)

  }

  async saveRoute() {
    try {
      await routes.createFavorite(this.trip.route.id)
      this.routeSaved.emit(this.trip.route.id)
      this.canSaveRoute = false
      notificationStore.show('Route saved. It will be available under Favorite Routes when choosing a ride.')
    }
    catch (e) {
      console.log(e.message)
    }
  }

  rideAgain() {
    ridesStore.setState(store => store.favoriteRoutePicked = this.trip.route)
    const unsubscribe = watch(
      ridesStore,
      () => ridesStore.pages?.lookingPage,
      (curr, prev) => curr && curr.onActivated('/rides') && unsubscribe()
    )
    window.router.navigate(['/looking'])
  }

  async leaveReview() {
    dialogStore.openDialog(
      await import('./reviewDriverDialog').then(m => m.default),
      {
        trip: this.trip,
        tripJustEnded: false
      },
      () => this.requestReload.emit()
    )
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