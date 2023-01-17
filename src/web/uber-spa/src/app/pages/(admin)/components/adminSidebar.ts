import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgFor, NgIf } from '@angular/common'
import { InnerHtml } from '@app/utils'
import { chatStore } from '@app/stores'

@Component({
  selector: 'AdminSidebar',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, InnerHtml],
  template: `
    <aside class="h-full w-[220px]">
      <a
        *ngFor="let option of options; trackBy: trackByName"
        [routerLink]="option.link"
        [routerLinkActiveOptions]="{exact: false}"
        routerLinkActive="border-l-4 border-black bg-[#f1f1f1]"
        class="w-full block p-3 pl-6 cursor-pointer transition hover:bg-[#f9f9f9]"
      >
        <span class="flex items-center justify-between">
          <span>{{ option.name }}</span>
          <span 
            *ngIf="chatStore.notifications > 0 && option.link === '/chat'" 
            class="bg-red-500 rounded-full w-2 h-2 ml-2.5 mb-0.5 mr-auto"
          >
          </span>
          <svg *ngIf="option.hasMore" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="15" y1="16" x2="19" y2="12"></line>
            <line x1="15" y1="8" x2="19" y2="12"></line>
          </svg>
        </span>
      </a>
    </aside>
  `
})
export default class AdminSidebar {
  chatStore = chatStore
  options = [
    {
      name: 'Settings',
      link: 'settings'
    },
    {
      name: 'Change password',
      link: 'password/change'
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
      name: 'Analytics',
      link: 'analytics'
    },
    {
      name: 'Live Support',
      link: '/chat',
      hasMore: true
    },
    {
      name: 'Register Uber',
      link: '/auth/signup/drive',
      hasMore: true
    },
  ]

  trackByName = (option: any) => option.name;
}
