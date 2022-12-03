import { Component } from '@angular/core'
import { Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { geocoder, map } from '@app/api/google-maps'
import { ridesStore } from '@app/stores/ridesStore'

@Component({
  standalone: true,
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-[28px] leading-[34px]">{{ title }}</h3>
        <div [hidden]="!isDragging && location.address !==''" class="w-52 h-3.5 mt-2 mb-4 rounded-sm bg-zinc-200"></div>
        <p [hidden]="isDragging || location.address ===''" class="text-lg pt-0.5 pb-2 text-zinc-700">
          {{ location.address }}, {{location.secondaryAddress}}
        </p>
        <button (click)="pickLocation()" class="primary w-full !text-base">{{ confirmationText }}</button>
        <button (click)="routerLocation.back()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class PickLocation {

  location: {
    placeId: string,
    address: string,
    secondaryAddress: string,
    longitude: number,
    latitude: number
  } = {} as any
  title: string
  confirmationText: string
  mapListeners: google.maps.MapsEventListener[]
  mapOverlay: HTMLElement
  isDragging: boolean

  constructor(route: ActivatedRoute, public routerLocation: Location) {
    const locationType = route.snapshot.queryParamMap.get('type')
    const longitude = Number(route.snapshot.queryParamMap.get('longitude'))
    const latitude = Number(route.snapshot.queryParamMap.get('latitude'))
    this.location.address = route.snapshot.queryParamMap.get('address')
    this.location.secondaryAddress = route.snapshot.queryParamMap.get('secondaryAddress')

    this.title = {
      'pickup': 'Set pickup location',
      'destination': 'Set destination',
      'stopover': 'Set where to stop at'
    }[locationType] ?? 'Choose location'

    this.confirmationText = {
      'pickup': 'Confirm pickup',
      'stopover': 'Confirm stop',
      'destination': 'Confirm destination'
    }[locationType] ?? 'Confirm location'

    this.mapOverlay = document.getElementById('google-map-overlay')
    const center = longitude && latitude ? { lat: latitude, lng: longitude } : map.getCenter()
    const marker = new google.maps.Marker({
      map,
      position: center,
      visible: false,
      draggable: false
    })
    map.setCenter(center)

    const setMarker = (element: HTMLElement) => element.innerHTML = /* html */ `
      <div class="flex flex-col justify-center items-center h-full ${this.isDragging ? '-mt-[22px]' : '-mt-4'}">
        <div class="flex justify-center items-center w-4 h-4 rounded-full bg-black">
          <div class="w-1 h-1 rounded-full bg-white"></div>
        </div>
        <div class="w-1 h-5 bg-black"></div>
        <div 
          style="box-shadow: rgb(0 0 0 / 20%) 0px 4px 16px"
          class="w-1.5 h-[5px] bg-black rounded-full mt-1.5 ${!this.isDragging && 'hidden'}"
        > 
        </div>
      </div>
    `

    const getAddress = async () => {
      this.location.address = this.location.secondaryAddress = ''
      const response = await geocoder.geocode({ location: map.getCenter() })
      const result = response.results[0];
      [this.location.address, this.location.secondaryAddress] = result?.formatted_address.split(',').slice(0, 2)
      this.location.placeId = result.place_id
      this.location.longitude = result.geometry.location.lng()
      this.location.latitude = result.geometry.location.lat()
    }

    this.mapListeners = [
      google.maps.event.addListener(map, 'center_changed', () => marker.setPosition(map.getCenter())),
      google.maps.event.addListener(map, 'dragstart', () => {
        this.isDragging = true
        setMarker(this.mapOverlay)
      }),
      google.maps.event.addListener(map, 'dragend', async () => {
        this.isDragging = false
        setMarker(this.mapOverlay)
        getAddress()
      })
    ]

    setMarker(this.mapOverlay)
    !this.location.address && getAddress()
  }

  pickLocation = () => {
    ridesStore.locationPicked = this.location
    this.routerLocation.back()
  }

  ngOnDestroy() {
    this.mapListeners.forEach(listener => listener.remove())
    this.mapOverlay.innerHTML = ''
  }

}