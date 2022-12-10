import { ridesStore } from '@app/stores/ridesStore';
import { Component } from '@angular/core'
import { Location, NgClass, NgFor, NgIf } from '@angular/common'
import { resource } from '@app/utils'
import routes from '@app/api/routes'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h2 class="text-4xl pb-2">Choose a route from your favorites</h2>
        <div *ngIf="favoriteRoutes.loading" class="w-[290px] h-[200px] mb-8 rounded-md bg-zinc-100 animate-pulse"></div>
        <div 
          *ngIf="!favoriteRoutes.loading && favoriteRoutes.value"
          class="flex space-x-4 my-2 py-2 overflow-x-auto px-1.5"
        >
          <div 
            [id]="'favorite-routes-route-' + index"
            *ngFor="let route of favoriteRoutes.value; index as index;"
          >
            <div 
              (click)="selectRoute(index)"
              class="w-[280px] h-[200px] rounded-md overflow-clip relative cursor-pointer"
              [ngClass]="{ 'ring-2 ring-black ring-offset-[3px]' : selectedRouteIndex === index }"
            >
              <img [src]="route.thumbnail" class="absolute -top-2 h-[210px] object-cover"/>
              <div>
                <div class="absolute w-full bottom-0 opacity-80 bg-gradient-to-t from-black to-transparent h-1/2"></div>
                <div class="absolute text-white left-2.5 bottom-2.5">
                  <div class="absolute left-0 bottom-0 bg-black bg-opacity-30 blur-lg w-full h-full"></div>
                  <div class="relative">
                    <p class="leading-4">{{ route.name }}</p>
                    <div class="flex flex-wrap">
                      <p class="text-sm">{{ route.start.address }}</p>
                      <p *ngFor="let stop of route.stops" class="text-sm">, {{ stop.address }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!favoriteRoutes.loading && !favoriteRoutes.value">
          <p class="text-zinc-700 mb-3">You haven't added any favorite routes yet. Go over to your profile to add one.</p>
        </div>
        <button 
          *ngIf="favoriteRoutes.loading || favoriteRoutes.value" 
          (click)="confirm()" 
          class="primary w-full !text-base mt-2"
        >
          Confirm Route
        </button>
        <button (click)="location.back()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class FavoriteRoutes {

  favoriteRoutes = resource(routes.favorites)
  selectedRouteIndex = 0

  constructor(public location: Location) { }

  selectRoute(index: number) {
    const scrollInline = index > this.selectedRouteIndex ? 'start' : 'end'
    this.selectedRouteIndex = index
    document.getElementById('favorite-routes-route-' + index)
      .scrollIntoView({ behavior: 'smooth', inline: scrollInline })
  }

  confirm() {
    ridesStore.setState(store => store.favoriteRoutePicked = this.favoriteRoutes.value[this.selectedRouteIndex])
    this.location.back()
  }
}