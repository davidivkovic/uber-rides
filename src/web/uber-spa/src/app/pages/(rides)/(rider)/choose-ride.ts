import { ChangeDetectorRef, Component } from '@angular/core'
import { Location, NgFor, NgIf, NgClass, CurrencyPipe } from '@angular/common'
import { Router } from '@angular/router'
import { subscribe, watch } from 'usm-mobx'
import { CloseButton } from '@app/components/ui/base/closeButton'
import { ridesStore } from '@app/stores/ridesStore'
import { notificationStore } from '@app/stores'
import trips from '@app/api/trips'
import { createMessage, OutboundMessages } from '@app/api/ws-messages/messages'
import { send } from '@app/api/ws'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, CloseButton, CurrencyPipe],
  template: `
    <div class="h-[700px] w-[400px] flex flex-col py-4 bg-white rounded-xl pointer-events-auto">
      <h3 class="text-4xl px-4">Choose a Ride</h3>
      <div 
        *ngIf="ridesStore.state?.directions?.carTypes?.length > 0"
        class="py-3 px-3.5 space-y-3 overflow-y-auto no-scrollbar w-full"
        [ngClass]="{ 'max-h-[340px]': ridesStore.state?.passengers?.length == 3 }"
      >
        <div
          *ngFor="let carType of ridesStore.state?.directions?.carTypes"
          (click)="selectCarType(carType)"
          class="rounded-md w-full flex items-center py-1 pr-2.5 transition"
          [ngClass]="{
            'ring-2 ring-neutral-500 ring-offset-[3px] transition-none': carType.carType === selectedCarType?.carType && !ridesStore.state.rideChosen,
            'cursor-pointer': !ridesStore.state.rideChosen,
            'pointer-events-none': ridesStore.state.rideChosen,
            'bg-zinc-100': carType.carType === selectedCarType?.carType && ridesStore.state.rideChosen
          }"
          
        >
          <img [src]="carType.image" class="w-[100px] h-[100px]" />
          <div class="w-[120px] ml-1.5 mr-6">
            <div class="flex space-x-2 font-medium">
              <h3 class="text-xl w-min">{{ carType.name }}</h3>
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
                {{ carType.seats }}
              </div>
            </div>
            <p class="text-sm text-gray-500">{{ carType.description }}</p>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="text-center">
                <h3 class="text-[22px]">
                  {{ ridesStore.state.directions.carPricesInUsd[carType.carType] | currency:'USD'}}
                </h3>
                <p 
                  *ngIf="anyPassengerReady" 
                  class="text-[13px] ml-0.5 -mt-1 mb-0.5 text-zinc-500"
                >
                  Per person
                </p>
                <p class="text-[13px] ml-0.5 -mt-1 text-zinc-500">Including tax</p>
              </div>
              <svg class="text-gray-500 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none"><title>Chevron right small</title><path d="M16.9 12l-4.6 6H8.5l4.6-6-4.6-6h3.8l4.6 6z" fill="currentColor"></path></svg>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="ridesStore.state?.passengers?.length" class="mt-3 px-5">
          <h3 class="mb-1">Passengers</h3>
          <div
            *ngFor="let passenger of ridesStore.state.passengers"
            class="flex items-center space-x-3 py-1"
          >
            <img [src]="passenger.profilePicture" class="w-7 h-7 rounded-full object-cover"/>
            <h3 class="flex-1 leading-4 text-[15px] tracking-wide mt-0.5">{{ passenger.firstName}} {{ passenger.lastName }}</h3>
            <svg *ngIf="!passenger.accepted && !passenger.declined" class="animate-spin ml-auto mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p *ngIf="!passenger.accepted && !passenger.declined" class="text-sm">Pending...</p>
            <div *ngIf="passenger.accepted" class="w-[7px] h-[7px] ml-auto rounded-full bg-green-600"></div>
            <p *ngIf="passenger.declined" class="ml-auto rounded text-white px-2 py-px text-[13px] bg-red-600">Declined</p>
            <CloseButton 
              class="mt-1"
              [extraSmall]="true"
              (click)="removePassenger(passenger)"
            >
            </CloseButton>
          </div>
        </div>
      <button 
        (click)="router.navigate(['looking/add-passengers'])" 
        class="secondary mx-4 !py-2.5 !text-base mt-auto"
      >
        Invite Passengers
      </button>
      <button 
        [disabled]="!passengersReady"
        (click)="location.back()"
        class="primary mx-4 !text-base mt-1"
      >
        {{ passengersReady ? 'Request an ' + this.selectedCarType?.name : 'Watiting for passengers...' }}
      </button>
    </div>
  `
})
export default class ChooseRide {

  selectedCarType: any = {}
  ridesStore = ridesStore
  passengersReady = true
  anyPassengerReady = false

  constructor(public location: Location, public router: Router, public detector: ChangeDetectorRef) {
    if (!ridesStore.state?.directions) {
      router.navigate(['/looking'])
    }
    ridesStore.setState(store => store.state.chooseRidesPage = this)
    subscribe(ridesStore, () => detector?.detectChanges())
    watch(
      ridesStore,
      () => ridesStore.state?.passengers,
      () => this.checkPassengersReady()
    )
    this.selectFirstCarType()
  }

  checkPassengersReady() {
    this.passengersReady =
      ridesStore.state?.passengers?.every((p: any) => p.accepted || p.declined) ||
      ridesStore.state?.passengers?.length === 0
    this.anyPassengerReady = ridesStore.state?.passengers?.some((p: any) => p.accepted)
  }

  selectFirstCarType() {
    this.selectedCarType = ridesStore.state?.directions?.carTypes[0]
  }

  async onActivated(navigatedFrom: string) {
    if (!this.selectedCarType?.carType) this.selectFirstCarType()
    if (navigatedFrom === 'add-passengers') {
      try {
        if (!ridesStore.state.rideChosen && ridesStore.state.passengers.length) {
          await trips.chooseRide(this.selectedCarType.carType)
          ridesStore.setState(store => store.state.rideChosen = true)
        }
        // ne valjda kad udjes da invite passengere, remove nekoga i ides acceept ne posalje remove passenger ws message
        if (ridesStore.state?.passengersChanged) {
          await trips.invitePassengers(ridesStore.state.passengers.map((p: any) => p.id))
        }
      }
      catch (error) {
        await window.router.navigate(['/looking'])
        notificationStore.show(error.message)
      }
    }
  }

  selectCarType(type: any) {
    this.selectedCarType = type
  }

  removePassenger(passenger: any) {
    send(
      createMessage(
        OutboundMessages.REMOVE_TRIP_PASSENGER,
        { passengerId: passenger.id }
      )
    )
    ridesStore.setState(store => {
      store.state.passengers = store.state.passengers.filter((p: any) => p.id !== passenger.id)
    })
  }

}