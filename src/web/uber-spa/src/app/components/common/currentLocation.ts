import { watch } from 'usm-mobx'
import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { geocoder, map, subscribe } from '@app/api/google-maps'
import { ridesStore, userStore } from '@app/stores'
import routes from '@app/api/routes'

@Component({
  selector: 'CurrentLocation',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="flex items-center gap-x-1 -mt-0.5">
      <img src="https://cdn-icons-png.flaticon.com/64/3138/3138667.png" class="w-3 h-3"/>
      <h3 class="text-[15px] tracking-wide truncate pr-2">
        {{  userStore.user.isOnline && location ? location : 'Location Invisible' }}
      </h3>
    </div>
  `
})
export default class CurrentLocation {
  userStore = userStore
  location: string = ''
  constructor() {
    let updates = 0
    watch(
      ridesStore,
      () => ridesStore.data?.currentLocation,
      async (curr, prev) => {
        if (!userStore.user.isOnline) return
        if (updates === 5) updates = 1
        if (updates++ > 1) return // Prevents the location from being updated too often
        if (!curr || curr === prev) return
        try {
          // const location = await geocoder.geocode({ location: curr })
          const location = await routes.geocode({ location: curr })
          this.location = location.results[0].address_components[1].long_name
        } catch (error) {
          console.log(error)
        }
      }
    )
    subscribe(() => ridesStore.setState(store => store.data.currentLocation = map.getCenter()))
  }
}