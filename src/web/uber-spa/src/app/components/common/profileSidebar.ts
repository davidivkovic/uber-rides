import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgFor } from '@angular/common'

@Component({
  selector: 'ProfileSidebar',
  standalone: true,
  imports: [RouterModule, NgFor],
  template: `
    <aside class="h-full w-[220px]">
      <a
        *ngFor="let option of options; trackBy: trackByName"
        [routerLink]="option.link"
        [routerLinkActiveOptions]="{exact: true}"
        routerLinkActive="border-l-4 border-black bg-[#f1f1f1]"
        class="w-full block p-3 pl-6 cursor-pointer transition hover:bg-[#f9f9f9]"
      >
        {{ option.name }}
      </a>
    </aside>
  `
})
export default class ProfileSidebar {
  options = [
    {
      name: 'Ride now',
      link: '/'
    },
    {
      name: 'My trips',
      link: 'rides'
    },
    {
      name: 'Settings',
      link: 'settings'
    },
    {
      name: 'Change password',
      link: 'password/change'
    },
    {
      name: 'Payment methods',
      link: 'payment'
    },
    {
      name: 'Payment test',
      link: 'pay'
    }
  ]

  trackByName = (item: any) => item.name;
}
