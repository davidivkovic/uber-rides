import { Component } from '@angular/core'
import { Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { geocoder, map } from '@app/api/google-maps'

@Component({
  selector: 'PickLocation',
  standalone: true,
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-[28px] leading-[34px]">{{ title }}</h3>
        <div [hidden]="!isDragging && address !==''" class="w-52 h-3.5 mt-2 mb-4 rounded-sm bg-zinc-200"></div>
        <p [hidden]="isDragging || address ===''" class="text-lg pt-0.5 pb-2 text-zinc-700">{{ address }}</p>
        <button (click)="location.back()" class="primary w-full !text-base">{{ confirmationText }}</button>
        <button (click)="location.back()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class PickLocation {

  title: string
  address: string
  confirmationText: string
  mapListeners: google.maps.MapsEventListener[]
  mapOverlay: HTMLElement
  isDragging: boolean

  constructor(route: ActivatedRoute, public location: Location) {
    const locationType = route.snapshot.queryParamMap.get('type')
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
    const marker = new google.maps.Marker({
      map,
      position: map.getCenter(),
      visible: false,
      draggable: false
    })

    const setMarker = (element: HTMLElement) => element.innerHTML = /* html */ `
      <div class="flex flex-col justify-center items-center h-full ${this.isDragging ? '-mt-[22px]' : '-mt-4'}">
        <div class="flex justify-center items-center w-4 h-4 rounded-full bg-black">
          <div class="w-1 h-1 rounded-full bg-white"></div>
        </div>
        <div class="w-1 h-5 bg-black"></div>
        <div 
          style="box-shadow: rgb(0 0 0 / 20%) 0px 4px 16px"
          class="w-1.5 h-1 bg-black rounded-full mt-1.5 ${!this.isDragging && 'hidden'}"
        > 
        </div>
      </div>
    `

    const getAddress = async () => {
      this.address = ''
      const response = await geocoder.geocode({ location: map.getCenter() })
      this.address = response.results[0]?.formatted_address.split(',').slice(0, 2).join(',')
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
    getAddress()
  }

  ngOnDestroy() {
    this.mapListeners.forEach(listener => listener.remove())
    this.mapOverlay.innerHTML = ''
  }

}