import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import ProfileSidebar from '@app/components/common/profileSidebar'
import Banner from '@app/components/common/banner'

@Component({
  standalone: true,
  imports: [RouterOutlet, ProfileSidebar, Banner],
  template: `
    <div class="flex w-[1265px] mx-auto pt-10 space-x-10">
      <ProfileSidebar></ProfileSidebar>
      <router-outlet></router-outlet>
      <Banner></Banner>
    </div>
  `
})
export default class Layout { }
