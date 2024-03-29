import { ChangeDetectorRef, Component } from '@angular/core'
import { Location, NgFor, NgIf, NgClass, CurrencyPipe } from '@angular/common'
import { Router } from '@angular/router'
import { subscribe, watch } from 'usm-mobx'
import { ridesStore } from '@app/stores/ridesStore'
import { dialogStore, notificationStore, userStore } from '@app/stores'
import trips from '@app/api/trips'
import { OutboundMessages } from '@app/api/ws-messages/messages'
import { send } from '@app/api/ws'
import PassengersStatus from '@app/components/rides/passengersStatus'
import payments from '@app/api/payments'
import methodLogos from '@app/../assets/files/payment-methods-icon.json'
import { PayDialog } from '@app/pages/(business)/profile/components/choosePaymentMethodDialog'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, PassengersStatus, CurrencyPipe],
  template: `
    <div class="h-[700px] w-[400px] flex flex-col py-4 bg-white rounded-xl pointer-events-auto">
      <h3 class="text-4xl px-4">Choose a Ride</h3>
      <div 
        *ngIf="ridesStore.data?.directions?.carTypes?.length > 0"
        class="py-3 px-3.5 space-y-3 overflow-y-auto no-scrollbar w-full"
        [ngClass]="{ 'max-h-[340px]': ridesStore.data?.passengers?.length == 3 }"
      >
        <div
          *ngFor="let carType of ridesStore.data?.directions?.carTypes"
          (click)="selectCarType(carType)"
          [id]="'CAR_' + carType.carType"
          class="rounded-md w-full flex items-center py-1 pr-2.5 transition"
          [ngClass]="{
            'ring-2 ring-neutral-500 ring-offset-[3px] transition-none': carType.carType === selectedCarType?.carType && !ridesStore.data.rideChosen,
            'cursor-pointer': !ridesStore.data.rideChosen,
            'pointer-events-none': ridesStore.data.rideChosen,
            'bg-zinc-100': carType.carType === selectedCarType?.carType && ridesStore.data.rideChosen
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
                  {{ ridesStore.data.directions.carPricesInUsd[carType.carType] | currency:'USD'}}
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
      <PassengersStatus 
        [passengers]="ridesStore.data?.passengers"
        [canRemove]="true"
        (passengerRemoved)="removePassenger($event)"
        class="mt-3 px-5"
      >
      </PassengersStatus>
      <div 
        id="choose-rides-add-payment-method"
        *ngIf="!lookingForRide && userStore.isAuthenticated" 
        class="h-10 w-full mt-auto" 
        (click)="changePaymentMethod()"
      >
        <div class=" w-full cursor-pointer flex items-center p-5" > 
          <div class="w-[30px] h-full flex items-center justify-top">
            <img
              [src]="methodLogos[defaultPaymentMethod?.typeDetails ?? 'default']"
              alt="Payment method icon"
              class="h-[22px] w-[22px] object-contain"
            />
          </div>
          <div class="flex justify-between items-center flex-1">
            <div class="flex space-x-1 items-baseline">
              <div class="text-sm">{{ defaultPaymentMethod?.name ?? "Add payment method" }}</div>
              <div class="text-xs">{{ defaultPaymentMethod?.email }}</div>
            </div>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Chevron right small</title><path d="M16.9 12l-4.6 6H8.5l4.6-6-4.6-6h3.8l4.6 6z" fill="currentColor"></path></svg>
          </div>
        </div>
      </div>
      <button 
        *ngIf="!lookingForRide && userStore.isAuthenticated"
        [disabled]="!defaultPaymentMethod"
        [title]="!defaultPaymentMethod ? 'Please add a payment method' : ''"
        (click)="router.navigate(['looking/add-passengers'])" 
        class="secondary mx-4 !py-2.5 !text-base mt-4"
      >
        Invite Passengers
      </button>
      <button 
        *ngIf="!lookingForRide"
        [disabled]="!passengersReady || (userStore.isAuthenticated && !defaultPaymentMethod)"
        [title]="!defaultPaymentMethod ? 'Please add a payment method' : ''"
        id="request-ride-button"
        (click)="pollOrder()"
        class="primary mx-4 !py-2.5 !text-base"
        [ngClass]="{ 
          'mt-auto': !userStore.isAuthenticated,
          'mt-1': userStore.isAuthenticated
        }"
      >
        {{ passengersReady ? 'Request an ' + this.selectedCarType?.name : 'Watiting for passengers...' }}
      </button>
      <button 
        id="cancel-request-ride-button"
        *ngIf="lookingForRide"
        [disabled]="!passengersReady"
        [ngClass]="{ 
          'pointer-events-none': ridesStore.data.uberFound, 
          'cursor-wait': ridesStore.data.uberFound 
        }"
        (click)="cancelOrder()"
        class="primary mx-4 !text-base mt-auto"
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
            Looking for an {{ this.selectedCarType?.name }}
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
  `
})
export default class ChooseRide {

  selectedCarType: any = {}
  ridesStore = ridesStore
  userStore = userStore
  passengersReady = true
  anyPassengerReady = false
  lookingForRide = false
  lookingDuration = 1
  lookingInterval = null
  lookingLoading = false
  uberFoundText = 'Uber found. Please wait...'
  defaultPaymentMethod = null
  methodLogos = methodLogos

  cleanUp() {
    this.lookingForRide = false
    clearInterval(this.lookingInterval)
    this.lookingInterval = null
    this.lookingDuration = 1
    this.lookingLoading = false
    this.uberFoundText = 'Uber found. Please wait...'
  }

  constructor(public location: Location, public router: Router, public detector: ChangeDetectorRef) {
    if (!ridesStore.data?.directions) {
      router.navigate(['/looking'])
    }
    ridesStore.setState(store => {
      store.data.looking = false
      store.data.choosingRide = true
      store.pages.chooseRidesPage = this
    })
    subscribe(ridesStore, () => detector?.detectChanges())
    watch(
      ridesStore,
      () => ridesStore.data.passengers,
      () => this.checkPassengersReady()
    )
    watch(
      ridesStore,
      () => ridesStore.data.uberFound,
      (curr, old) => {
        if (!curr) return
        setTimeout(() => this.uberFoundText = 'Processing payment...', 1500)
        // setTimeout(() => this.router.navigate(['/passengers']), 3000)
      }
    )
    this.selectFirstCarType()
  }

  async ngOnInit() {
    this.userStore.isAuthenticated && this.fetchDefaultMethod()
  }

  async fetchDefaultMethod() {
    try {
      const method = await payments.getDefault()
      if (method.type == 'CARD') {
        method.name = `${method.typeDetails} - ${method.cardNumber.slice(15)} (${method.nickname})`
      }
      this.defaultPaymentMethod = method
    } catch (err) {

    }
  }

  changePaymentMethod() {
    dialogStore.openDialog(
      PayDialog,
      { refetchDefaultMethod: this.fetchDefaultMethod },
      () => this.fetchDefaultMethod()
    )
  }

  cancelOrder() {
    if (ridesStore.data.uberFound) return
    this.lookingForRide = false
    this.lookingInterval && clearInterval(this.lookingInterval)
    if (!ridesStore.data?.passengers || ridesStore.data?.passengers?.length === 0) {
      ridesStore.setState(store => store.data.rideChosen = false)
    }
    send(OutboundMessages.NOT_LOOKING)
  }

  async pollOrder() {
    if (!this.userStore.isAuthenticated) {
      this.router.navigate(['/auth/login'])
      return
    }
    this.lookingForRide = true
    this.lookingDuration = 1
    if (!ridesStore.data.rideChosen) {
      ridesStore.setState(store => store.data.rideChosen = true)
      try {
        const trip = await trips.chooseRide(this.selectedCarType.carType)
        trip && ridesStore.setState(store => store.data.trip = trip)
      }
      catch (e) {
        console.log(e.message)
        this.cancelOrder()
        return
      }
    }
    this.lookingInterval = setInterval(async () => {
      if (this.lookingDuration >= 10) {
        this.cancelOrder()
        return
      }
      this.lookingDuration += 1
      if (this.lookingDuration % 5 !== 0) return
      if (this.lookingLoading) return
      this.lookingLoading = true
      await this.orderRide()
      this.lookingLoading = false
    }, 1000)
  }

  async orderRide() {
    if (ridesStore.data.trip == null) return
    try {
      await trips.orderRide()
      this.lookingInterval && clearInterval(this.lookingInterval)
    }
    catch (e) {
      console.log(e.message)
    }
  }

  checkPassengersReady() {
    this.passengersReady =
      ridesStore.data?.passengers?.every((p: any) => p.accepted || p.declined) ||
      ridesStore.data?.passengers?.length === 0
    this.anyPassengerReady = ridesStore.data?.passengers?.some((p: any) => p.accepted)
  }

  selectFirstCarType() {
    this.selectedCarType = ridesStore.data?.directions?.carTypes[0]
  }

  async onActivated(navigatedFrom: string) {
    ridesStore.setState(store => {
      store.data.looking = false
      store.data.choosingRide = true
    })
    if (!this.selectedCarType?.carType) this.selectFirstCarType()
    if (navigatedFrom === 'add-passengers') {
      try {
        if (!ridesStore.data.rideChosen && ridesStore.data?.passengers?.length) {
          await trips.chooseRide(this.selectedCarType.carType)
          ridesStore.setState(store => store.data.rideChosen = true)
        }
        // ne valjda kad udjes da invite passengere, remove nekoga i ides acceept ne posalje remove passenger ws message
        if (ridesStore.data?.passengersChanged) {
          const trip = await trips.invitePassengers(ridesStore.data.passengers.map((p: any) => p.id))
          trip && ridesStore.setState(store => store.data.trip = trip)
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
    send(OutboundMessages.REMOVE_TRIP_PASSENGER, { passengerId: passenger.id })
    ridesStore.setState(store => {
      store.data.passengers = store.data.passengers.filter((p: any) => p.id !== passenger.id)
    })
  }

}