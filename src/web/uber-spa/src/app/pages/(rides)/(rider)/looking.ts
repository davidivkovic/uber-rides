import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { autocomplete, geocoder, icons, map } from '@app/api/google-maps'
import { computed, InnerHtml, swap } from '@app/utils'
import { ridesStore } from '@app/stores/ridesStore'
import dayjs from 'dayjs'

type AutocompleteLocation = {
  id: string
  primary: string
  secondary: string
  icon: string,
  selected: boolean
}

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, InnerHtml, FormsModule],
  template: `
    <div class="flex flex-col h-[700px] w-[400px] bg-white pointer-events-auto rounded-xl overflow-y-clip">
      <div class="p-4 pb-3.5">
        <h1 class="text-4xl leading-[44px] transition">{{ cardTitles[focusedStopoverType()] }}</h1>
        <div [ngClass]="{ 'mr-5' : stopoverInputs.length > 2 }">
          <button 
            (click)="router.navigate(['looking/favorite-routes'])"
            class="secondary flex w-full justify-between space-x-2 items-center rounded-md px-3 py-2 mt-3 mb-3.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <circle cx="6" cy="19" r="2"></circle>
              <circle cx="18" cy="5" r="2"></circle>
              <path d="M12 19h4.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h3.5"></path>
            </svg>
            <span> Favorite routes </span>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Chevron down small</title><path d="M18 8v3.8l-6 4.6-6-4.6V8l6 4.6L18 8z" fill="currentColor"></path></svg>
          </button>
        </div>
        <ng-container *ngFor="let stopover of stopoverInputs; index as index; trackBy: ngForIdentity">
          <div class="flex items-center mb-3.5">
            <div class="relative w-full group">
              <input 
                type="text"
                autocomplete="off"
                spellcheck="false"
                [id]="'stopover-input-' + index"
                [placeholder]="
                  index === 0 ? 'Add pickup location' :
                  index === stopoverInputs.length - 1 ? 'Enter destination' : 'Add stop'
                "
                [(ngModel)]="stopover.address"
                (input)="query(index)"
                (input)="locationsCompleted = false"
                (focus)="focusStopoverInput(index)"
                (focus)="blurred = false"
                (blur)="unFocusStopoverInput()"
                (blur)="blurred = true"
                class="pl-14 h-12 placeholder:text-[15px] text-base"
              />
            </div>
            <button 
              *ngIf="stopoverInputs.length > 2"
              (click)="removeStop(index)"
              class="px-1 py-2 ml-1 -mr-2" 
              tabindex="-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="absolute -mt-[42px] ml-7 z-10">
            <div class="w-1.5 h-1.5 border-2 border-black rounded-full"></div>
            <div 
              *ngIf="index !== stopoverInputs.length - 1" 
              class="w-[2px] h-12 ml-[2px] my-[5px] bg-black"
            >
            </div>
          </div>
        </ng-container>
        <div 
          class="flex items-start space-x-1.5"
          [ngClass]="{ 'mr-5' : stopoverInputs.length > 2 }"
        >
          <button
            class="secondary flex items-center space-x-2.5 rounded-full mr-auto !py-2 !px-3"
            (click)="router.navigate(
              ['looking/choose-time'],
              { 
                queryParams: { 
                  pickup: stopoverInputs[0].address && stopoverInputs[0].address + ', ' + stopoverInputs[0].secondaryAddress
                } 
              }
            )"
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
              <title>Clock</title>
              <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm6 13h-8V4h3v7h5v3z" fill="currentColor"></path>
            </svg>
            <span class="text-sm whitespace-nowrap">{{ departureTime }}</span>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Chevron down small</title><path d="M18 8v3.8l-6 4.6-6-4.6V8l6 4.6L18 8z" fill="currentColor"></path></svg>
          </button>
          <button 
            *ngIf="focusedStopover > -1 && !blurred"
            (mousedown)="moveStop($event, 'up')"
            [ngClass]="{ 'opacity-30 cursor-default hover:!bg-[#eeeeee]' : !canMoveStopUp() }"
            class="secondary rounded-full p-1.5 hover:bg-zinc-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="16" y1="9" x2="12" y2="5"></line>
              <line x1="8" y1="9" x2="12" y2="5"></line>
            </svg>
          </button>
          <button  
            *ngIf="focusedStopover > -1 && !blurred"
            (mousedown)="moveStop($event, 'down')"
            [ngClass]="{ 'opacity-30 cursor-default hover:!bg-[#eeeeee]' : !canMoveStopDown() }"
            class="secondary rounded-full p-1.5 mr-0.5 hover:bg-zinc-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="16" y1="15" x2="12" y2="19"></line>
              <line x1="8" y1="15" x2="12" y2="19"></line>
            </svg>
          </button>
          <button 
            *ngIf="stopoverInputs.length < 5 && blurred"
            (click)="addStop()"
            class="flex items-center secondary rounded-full px-4 !py-[2px] !text-sm whitespace-nowrap"
          >
            Add stop
            <span class="text-2xl ml-2">+</span>
          </button>
        </div>
      </div>
      <div *ngIf="!locationsCompleted" class="overflow-y-auto scroll-smooth no-scrollbar">
        <div
          (click)="chooseLocationOnMap()"
          class="flex space-x-4 items-center cursor-pointer hover:bg-[#eeeeee] px-4 py-3"
        >
          <div [innerHTML]="icons.pickerIcon | innerHTML" class="p-2 rounded-full bg-[#ececec]"></div>
          <p class="leading-tight">Choose location on map</p>
        </div>
        <div 
          *ngFor="let location of autocompleteLocations[activeStopover]; trackBy: autocompleteIdentity"
          (click)="selectLocation(activeStopover, location)"
          class="flex space-x-4 items-center cursor-pointer hover:bg-[#eeeeee] px-4 py-3"
          [ngClass]="{ 'bg-[#eeeeee]' : location.selected }"
        >
          <div [innerHTML]="location.icon | innerHTML" class="p-2 rounded-full bg-[#ececec]"></div>
          <div>
            <p class="leading-tight">{{ location.primary }}</p>
            <p class="text-sm text-zinc-600">{{ location.secondary }}</p>
          </div>
        </div>
      </div>
      <div 
        *ngIf="locationsCompleted" 
        class="px-4 pb-4 flex flex-col h-full"
      >
        <button 
          (click)="router.navigate(['add-passengers'])"
          class="secondary w-full !text-base mt-auto mb-1.5"
        >
          Add passengers
        </button>
        <button 
          (click)="router.navigate(['choose-ride'])"
          class="primary w-full !text-base"
        >
          Choose a ride
        </button>
      </div>
    </div>
  `
})
export default class Looking {

  icons = icons
  makeEmptyStopover = () => ({ placeId: '', address: '', secondaryAddress: '', longitude: 0, latitude: 0 })

  stopoverInputs: {
    placeId: string,
    address: string,
    secondaryAddress: string,
    longitude: number,
    latitude: number
  }[] = [
      this.makeEmptyStopover(),
      this.makeEmptyStopover()
    ]

  autocompleteLocations: AutocompleteLocation[][] = []

  /* 
    -2 -> initial value
    -1 -> empty value
    n -> focused n-th stopover
  */
  focusedStopover = -2
  activeStopover = this.focusedStopover
  locationsCompleted = false
  blurred = true
  departureTime = 'Depart now'

  constructor(public router: Router, public route: ActivatedRoute) { }

  async onActivated() {
    if (ridesStore.locationPicked?.address) {
      if (this.activeStopover <= -1) {
        this.focusFirstEmptyStopoverInput()
      }
      const index = Math.max(this.activeStopover, 0)
      const location = ridesStore.locationPicked
      this.stopoverInputs[index].address = location.address
      if (!this.checkLocationsCompleted()) {
        this.focusFirstEmptyStopoverInput()
        this.focusStopoverInputElement(this.focusedStopover)
      }
      await this.query(index, location.address + ', ' + location.secondaryAddress)
      const locationToSelect = this.autocompleteLocations[index].find(l => l.id === ridesStore.locationPicked.placeId)
      this.selectLocation(index, locationToSelect ?? this.autocompleteLocations[index][0], true)
      ridesStore.locationPicked = this.makeEmptyStopover()
    }
    if (ridesStore.rideBuilder.scheduledAt) {
      const day = ridesStore.rideBuilder.scheduledAt.isSame(dayjs(), 'day') ? 'Today' : 'Tomorrow'
      this.departureTime = day + ridesStore.rideBuilder.scheduledAt.format(', h:mm A')
    } else {
      this.departureTime = 'Depart now'
    }
  }

  checkLocationsCompleted() {
    this.locationsCompleted = this.stopoverInputs.every(i => i.address !== '')
    return this.locationsCompleted
  }

  focusFirstEmptyStopoverInput() {
    this.focusStopoverInput(this.stopoverInputs.findIndex(i => i.address === ''))
  }

  query = async (index: number, term?: string) => {
    const text = term || this.stopoverInputs[index].address?.trim()
    if (text === '') {
      this.autocompleteLocations[index] = []
      return
    }
    const response = await autocomplete.getPlacePredictions({ input: text })
    // if (status !== 'OK') return
    this.autocompleteLocations[index] =
      response.predictions.map(({ place_id, structured_formatting, types }: any) => ({
        id: place_id,
        primary: structured_formatting.main_text,
        secondary: structured_formatting.secondary_text,
        icon: this.getIcon(types),
        selected: false
      }))
  }

  clearSelectedLocations = () => this.autocompleteLocations[this.activeStopover]?.forEach(l => l.selected = false)

  chooseLocationOnMap() {
    this.router.navigate(
      ['looking/pick-location'],
      {
        queryParams: {
          type: this.focusedStopoverType(),
          longitude: this.stopoverInputs[this.activeStopover]?.longitude,
          latitude: this.stopoverInputs[this.activeStopover]?.latitude,
          address: this.stopoverInputs[this.activeStopover]?.address,
          secondaryAddress: this.stopoverInputs[this.activeStopover]?.secondaryAddress,
        }
      }
    )
  }

  selectLocation = async (index: number, location: AutocompleteLocation, skipCompleteCheck = false) => {
    this.stopoverInputs[index] = {
      placeId: location.id,
      address: location.primary,
      secondaryAddress: location.secondary,
      latitude: 0,
      longitude: 0
    }
    this.clearSelectedLocations()
    location.selected = true
    const response = await geocoder.geocode({ placeId: location.id })
    // if (status !== 'OK') return
    // if (!results[0]) return
    const geometry = response.results[0].geometry.location
    this.stopoverInputs[index].longitude = geometry.lng()
    this.stopoverInputs[index].latitude = geometry.lat()
    map.setCenter(geometry)
    if (!skipCompleteCheck && !this.checkLocationsCompleted()) {
      this.focusFirstEmptyStopoverInput()
      this.focusStopoverInputElement(this.focusedStopover)
    }
  }

  getIcon = (locationTypes: string[]) => {
    if (locationTypes?.includes('airport')) return icons.airportIcon
    if (locationTypes?.includes('restaurant')) return icons.restaurantIcon
    if (locationTypes?.includes('store')) return icons.storeIcon
    if (locationTypes?.includes('picker')) return icons.pickerIcon
    return icons.locationIcon
  }

  focusedStopoverType = computed<string>(
    [() => this.activeStopover, () => this.locationsCompleted],
    previous => {
      const id = this.activeStopover
      if (this.locationsCompleted) return 'travel'
      if (id === -1) return previous
      if (id <= 0) return 'pickup'
      if (id === this.stopoverInputs.length - 1) return 'destination'
      return 'stopover'
    }
  )

  cardTitles = {
    'travel': 'Choose a ride or add passengers first',
    'pickup': 'Where can we pick you up?',
    'stopover': 'Where are we stopping at?',
    'destination': 'Where are you heading to?'
  }

  setFocusedStopover = (id: number) => {
    this.focusedStopover = id
    this.activeStopover = id === -1 ? this.activeStopover : id
  }
  focusStopoverInput = (id: number) => {
    this.setFocusedStopover(id)
    this.locationsCompleted = false
  }
  unFocusStopoverInput = () => {
    this.setFocusedStopover(-1)
  }
  focusStopoverInputElement = (index: number) => document.getElementById('stopover-input-' + index)?.focus()

  canMoveStopUp = computed(
    () => this.focusedStopover,
    () => this.focusedStopover > 0
  )
  canMoveStopDown = computed(
    () => this.focusedStopover,
    () => this.focusedStopover >= 0 && this.focusedStopover < this.stopoverInputs.length - 1
  )

  addStop = () => {
    const length = this.stopoverInputs.length
    this.stopoverInputs.splice(length - 1, 0, this.makeEmptyStopover())
    swap(this.autocompleteLocations, length - 1, length)
    this.locationsCompleted = false
    this.focusFirstEmptyStopoverInput()
    this.focusStopoverInputElement(this.focusedStopover)
  }

  removeStop = (index: number) => {
    this.stopoverInputs.splice(index, 1)
    this.autocompleteLocations.splice(index, 1)
    this.checkLocationsCompleted()
  }

  moveStop = (event: MouseEvent, direction: 'up' | 'down') => {
    event.preventDefault()
    let index = this.focusedStopover
    const stop = this.stopoverInputs[index]

    if (direction == 'up') {
      if (!this.canMoveStopUp()) return
      this.stopoverInputs.splice(index, 1);
      swap(this.autocompleteLocations, index, --index)
    }
    else if (direction === 'down') {
      if (!this.canMoveStopDown()) return
      this.stopoverInputs.splice(index, 1)
      swap(this.autocompleteLocations, index, ++index)
    }

    this.stopoverInputs.splice(index, 0, stop)
    this.focusStopoverInputElement(index)
    // this.checkLocationsCompleted()
  }

  ngForIdentity = (index: number, item: any) => index
  autocompleteIdentity = (index: number, item: AutocompleteLocation) => item.id

}