import { Component } from '@angular/core'
import { NgIf, DecimalPipe } from '@angular/common'
import { map } from '@app/api/google-maps'
import { getCurrentWeather } from '@app/api/weather'
import { subscribe } from '@app/api/google-maps'

@Component({
  selector: 'Weather',
  standalone: true,
  imports: [NgIf, DecimalPipe],
  template: `
  <div *ngIf="currentWeather" class="flex">
    <div 
      class="inline-flex rounded-full border bg-white border-neutral-200 pl-1 pr-3 items-center"
      [title]="currentWeather.weather[0].main"
    >
      <img 
        [src]="'https://openweathermap.org/img/wn/' + currentWeather.weather[0].icon + '.png'"
        class="h-8 w-8 object-cover pointer-events-none"
        />
        <span class="pointer-events-none">{{ currentWeather.main.temp | number : '1.0-0' }} <span>°</span> </span>
      </div>
    </div>
  `
})
export default class Weather {
  currentWeather: any
  constructor() {
    subscribe(async () =>
      this.currentWeather = await getCurrentWeather(map.getCenter().lat(), map.getCenter().lng())
    )
  }
}