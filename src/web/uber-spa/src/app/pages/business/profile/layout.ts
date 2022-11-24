import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import ProfileSidebar from '@app/components/common/profileSidebar'
import Banner from '@app/components/common/banner'

@Component({
  standalone: true,
  imports: [RouterOutlet, ProfileSidebar, Banner],
  template: `
    <div class="flex h-full w-[1265px] mx-auto mt-10 space-x-10">
      <ProfileSidebar></ProfileSidebar>
      <div class="flex justify-center w-full">
        <router-outlet></router-outlet>
      </div>
      <Banner></Banner>
    </div>
  `
})
export default class Layout {}
