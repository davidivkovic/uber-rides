import { NgClass, NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { userStore } from '@app/stores'
import ProfileSidebar from '@app/components/common/profileSidebar'
import Banner from '@app/components/common/banner'

@Component({
  standalone: true,
  imports: [NgIf, NgClass, RouterOutlet, ProfileSidebar, Banner],
  template: `
    <div class="flex w-[1265px] mx-auto pt-10 space-x-10">
      <ProfileSidebar></ProfileSidebar>
      <div 
        [ngClass]="{ 
          'w-[700px]': userStore.isDriver,
          'w-full': userStore.isRider
        }"
      >
        <router-outlet></router-outlet>
      </div>
      <Banner *ngIf="userStore.isRider"></Banner>
    </div>
  `
})
export default class Layout {
  userStore = userStore
}
