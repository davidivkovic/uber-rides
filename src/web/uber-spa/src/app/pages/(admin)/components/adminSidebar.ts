import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgFor } from '@angular/common'

@Component({
  selector: 'AdminSidebar',
  standalone: true,
  imports: [RouterModule, NgFor],
  template: `
    <aside class="h-full w-[220px]">
      <a
        *ngFor="let option of options; trackBy: trackByName"
        [routerLink]="option.link"
        [routerLinkActiveOptions]="{exact: false}"
        routerLinkActive="border-l-4 border-black bg-[#f1f1f1]"
        class="w-full block p-3 pl-6 cursor-pointer transition hover:bg-[#f9f9f9]"
      >
        {{ option.name }}
      </a>
    </aside>
  `
})
export default class AdminSidebar {
  options = [
    {
      name: 'Register Uber',
      link: 'auth/signup/drive'
    },
    {
      name: 'Update Requests',
      link: 'update-requests'
    },
    {
      name: 'Drivers',
      link: 'drivers'
    },
    {
      name: 'Riders',
      link: 'riders'
    },
    {
      name: 'Live Support',
      link: 'chat'
    },
    {
      name: 'Analytics',
      link: 'analytics'
    }
  ]

  trackByName = (option: any) => option.name;
}
