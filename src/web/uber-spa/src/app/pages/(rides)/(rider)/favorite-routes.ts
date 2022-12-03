import { Component } from '@angular/core'
import { Location, NgFor, NgIf } from '@angular/common'
import { resource } from '@app/utils'
import routes from '@app/api/routes'

@Component({
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-[28px] leading-[34px] pb-2">Choose a route from your favorites</h3>
        <div *ngFor="let route of favoriteRoutes?.value ?? []">
          {{ route.name }}
          <img [src]="route.thumbnail"/>
        </div>
        <button (click)="confirm()" class="primary w-full !text-base">Conirm Route</button>
        <button (click)="location.back()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class FavoriteRoutes {

  favoriteRoutes = resource(routes.favorites)

  constructor(public location: Location) { }

  confirm() {

  }
}