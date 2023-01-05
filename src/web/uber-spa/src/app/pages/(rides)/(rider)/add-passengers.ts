import { Component } from '@angular/core'
import { Location, NgClass, NgFor, NgIf } from '@angular/common'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { CloseButton } from '@app/components/ui/base/closeButton'
import riders from '@app/api/riders'
import { ridesStore } from '@app/stores/ridesStore'
import { send } from '@app/api/ws'
import { OutboundMessages } from '@app/api/ws-messages/messages'

@Component({
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass, CloseButton],
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] h-[450px] flex flex-col p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-4xl pb-2">Invite passengers</h3>
        <div class="relative">
          <svg class="absolute left-3 w-5 h-full" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <input
            id="rides-add-passenger-input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            [disabled]="passengers.length >= 3"
            [placeholder]="passengers.length >= 3 ? 'Maximum of 3 passengers reached' : 'Search for passengers'"
            [(ngModel)]="query"
            (input)="queryChanged()"
            (focus)="inputFocused = true"
            (blur)="inputFocused = false"
            class="pl-10 mt-1"
          />
          <ul 
            role="listbox"
            class="w-full max-h-[400px] mt-2 bg-white border border-zinc-300 shadow-lg overflow-y-auto rounded-md" 
            [ngClass]="inputFocused && users.length ? 'absolute' : 'hidden'"
          >
            <li 
              role="option"
              *ngFor="let user of users; trackBy: ngForIdentity; index as index"
              (mousedown)="addPassenger(user, $event)"
              (mouseup)="afterAddPassenger()"
              class="hover:bg-zinc-200 cursor-pointer p-3"
              [class]="{ 
                '!pb-3.5' : index === users.length - 1,
                '!pt-3.5' : index === 0 
              }"
            >
              <div class="flex items-center space-x-3">
                <img [src]="user.profilePicture" class="w-9 h-9 rounded-full object-cover"/>
                <div>
                  <p class="leading-4">{{ user.firstName}} {{ user.lastName }}</p>
                  <p class="text-sm text-zinc-600">{{ user.email }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div *ngIf="!passengers.length" class="mt-4 px-1">
          <p class="text-zinc-500 text-[15px]">
            You may invite up to 3 passengers. The ride fare will be split evenly among you and them.
          </p>
        </div>
        <div *ngIf="passengers.length" class="mt-6 mb-0.5">
          <div
            *ngFor="let passenger of passengers; trackBy: ngForIdentity"
            class="flex items-center space-x-3 p-3"
          >
            <img [src]="passenger.profilePicture" class="w-9 h-9 rounded-full object-cover"/>
            <div class="flex-1">
              <p class="leading-4">{{ passenger.firstName}} {{ passenger.lastName }}</p>
              <p class="text-sm text-zinc-600">{{ passenger.email }}</p>
            </div>
            <CloseButton 
              [small]="true"
              (click)="removePassenger(passenger)"
            >
            </CloseButton>
          </div>
        </div>
        <button (click)="confirmPassengers()" class="primary w-full !text-base mt-auto">Invite passengers</button>
        <button (click)="cancel()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class AddPassengers {

  query = ''
  users = []
  passengers = []
  removedPassengers = []
  inputFocused = false

  constructor(public router: Router, public location: Location) {
    this.onActivated()
  }

  onActivated() {
    this.passengers = JSON.parse(JSON.stringify(ridesStore.data?.passengers ?? []))
    this.removedPassengers = []
  }

  async queryChanged() {
    this.users = await riders.search(this.query)
  }

  addPassenger(passenger: any, event: any) {
    event.preventDefault()

    if (this.passengers.every(p => p.id !== passenger.id)) {
      this.passengers.push(passenger)
    }
    this.query = ''
    this.users = []
  }

  afterAddPassenger() {
    if (this.passengers.length < 3) {
      document.getElementById('rides-add-passenger-input').focus()
    }
  }

  removePassenger(passenger: any) {
    this.removedPassengers.push(passenger)
    this.passengers = this.passengers.filter(p => p.id !== passenger.id)
  }

  async confirmPassengers() {
    ridesStore.setState(store => {
      store.data.passengers = this.passengers.map(p => ({ accepted: false, declined: false, ...p }))
      store.data.passengersChanged = true
      this.location.back()
    })
    this.removedPassengers.forEach(passenger => {
      send(OutboundMessages.REMOVE_TRIP_PASSENGER, { passengerId: passenger.id })
    })
  }

  cancel() {
    ridesStore.setState(store => {
      store.data.passengersChanged = false
      this.location.back()
    })
  }

  ngForIdentity = (index: number, item: any) => item.id
}