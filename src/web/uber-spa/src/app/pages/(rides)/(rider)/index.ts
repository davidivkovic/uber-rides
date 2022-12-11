import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import { init } from '@app/api/google-maps'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterOutlet],
  template: `
    <div class="h-full relative">
      <div id="google-map-container" class="absolute w-full h-full">
        <div id="google-map" class="absolute w-full h-full"></div>
        <div id="google-map-overlay" class="absolute w-full h-full pointer-events-none"></div>
      </div>
      <div class="h-full w-full absolute z-10 pointer-events-none">
        <div class="max-w-7xl mx-auto w-full h-full flex items-center px-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export default class Index {
  ngAfterViewInit() {
    init('google-map')
  }
}