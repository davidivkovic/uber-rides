import { Component } from '@angular/core'
import { NgClass, NgIf } from '@angular/common'
import { ridesStore, userStore } from '@app/stores'
import Weather from '@app/components/common/weather'
import CurrentTime from '@app/components/common/currentTime'
import CarRegistration from '@app/components/rides/carRegistration'
import CurrentLocation from '@app/components/common/currentLocation'
import { PFP } from '@app/utils'

@Component({
  selector: 'StatusBar',
  standalone: true,
  imports: [NgIf, NgClass, Weather, CurrentTime, CarRegistration, CurrentLocation, PFP],
  template: `
    <div class="flex items-center gap-x-2 mb-3 mt-0.5">
      <img [src]="userStore.user.profilePicture | PFP" class="h-14 w-14 rounded-full object-cover"/>
      <div>
        <div class="flex items-center gap-x-2">
          <h1 class="text-xl leading-[26px]"> 
            {{ userStore.user.firstName }} {{ userStore.user.lastName }}
          </h1>
          <span 
            class="w-2 h-2 mt-px rounded-full"
            [ngClass]="{ 'bg-green-500': userStore.user.isOnline, 'bg-orange-500': !userStore.user.isOnline }"
          >
          </span>
        </div>
        <CurrentLocation></CurrentLocation>
        <p class="text-sm text-zinc-500 ml-0.5 leading-4"> 
          <span *ngIf="!ridesStore.data?.fatigue?.isFatigued && ridesStore.data?.fatigue?.driveTime">
            {{ ridesStore.data.fatigue.driveTime + ' Drive Time Remaining' }}
          </span>
          <span *ngIf="ridesStore.data?.fatigue?.isFatigued">
            <!-- {{ 'You can drive again in ' + ridesStore.data.fatigue.fatigueEnd + 'h' }} -->
          </span>
        </p>
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
  ridesStore = ridesStore
}