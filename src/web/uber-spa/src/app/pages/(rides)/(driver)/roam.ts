import { ridesStore } from '@app/stores/ridesStore';
import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import StatusBar from './components/statusBar'
import { map } from '@app/api/google-maps';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, StatusBar],
  template: `
    <div class="h-[700px] w-[400px] flex  overflow-y-clip pointer-events-auto">
      <div class="flex flex-col w-full h-[384px] bg-white p-4 rounded-xl mt-10">
        <StatusBar></StatusBar>
        <div class="mt-16 text-center">
          <div class="flex justify-center items-center gap-x-2">
            <h3 class="text-xl">Looking for a ride</h3>
            <span class="flex h-2 w-2 relative mt-0.5 -mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <p class="text-sm text-zinc-500 -mt-0.5">You will be notified when we assign you a ride</p>
          <button class="primary w-full mt-[84px]">Go offline</button>
        </div>
      </div>
    </div>
  `
})
export default class Pickup {

}