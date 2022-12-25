import { Component } from '@angular/core'
import { userStore } from '@app/stores'
import Weather from '@app/components/common/weather'
import CurrentTime from '@app/components/common/currentTime'
import CarRegistration from '@app/components/rides/carRegistration'
import CurrentLocation from '@app/components/common/currentLocation'

@Component({
  selector: 'StatusBar',
  standalone: true,
  imports: [Weather, CurrentTime, CarRegistration, CurrentLocation],
  template: `
    <div class="flex items-center gap-x-2 mb-3 mt-0.5">
      <img [src]="userStore.user.profilePicture" class="h-14 w-14 rounded-full object-cover"/>
      <div>
        <div class="flex items-center gap-x-2">
          <h1 class="text-xl leading-[26px]"> 
            {{ userStore.user.firstName }} {{ userStore.user.lastName }}
          </h1>
          <span class="w-2 h-2 mt-px bg-green-500 rounded-full"></span>
        </div>
        <CurrentLocation></CurrentLocation>
        <p class="text-sm text-zinc-500 ml-0.5 leading-4"> 2H Drive Time Remaining</p>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <CarRegistration [car]="userStore.user.car"></CarRegistration>
      <CurrentTime class="-ml-12 mt-0.5"></CurrentTime>
      <Weather></Weather>
    </div>
  `
})
export default class StatusBar {
  userStore = userStore
}