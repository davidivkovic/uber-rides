import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import ProfileSidebar from 'src/app/components/common/profileSidebar'

@Component({
  standalone: true,
  imports: [RouterOutlet, ProfileSidebar],
  template: `
    <div class="flex h-full">
      <ProfileSidebar></ProfileSidebar>
      <div class="flex justify-center w-full">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export default class ProfileSidebarLayout {}
