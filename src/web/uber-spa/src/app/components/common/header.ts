import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgIf } from '@angular/common'
import { userStore } from '@app/stores/userStore'
import { chatStore, ridesStore } from '@app/stores'

@Component({
  selector: 'Header',
  standalone: true,
  imports: [RouterModule, NgIf],
  template: `
    <div id="header" class="bg-black h-14 w-full flex justify-center">
      <div class="max-w-7xl px-3 w-full flex items-center justify-between mx-auto text-sm">
        <div class="flex space-x-5 items-center">
          <a routerLink="/" class="p-2 mb-1">
            <img
              alt="Uber logo"
              class="h-4"
              src="https://www.pngfind.com/pngs/b/54-545787_uber-logo-png.png"
            />
          </a>
          <div>
            <button routerLink="/" class="primary rounded-3xl px-3 py-2 text-white">Home</button>
            <button *ngIf="userStore.isAuthenticated && !userStore.isAdmin"
              routerLink="/live-support"
              class="primary rounded-3xl px-3 py-2 relative"
            >
              <span>Live support</span>
              <span 
                *ngIf="chatStore.notifications > 0" 
                class="absolute top-0.5 right-0 bg-red-500 rounded-full w-2 h-2"
              >
              </span>
            </button>
          </div>
        </div>
        <div *ngIf="userStore.isAuthenticated" class="space-x-2">
          <div class="flex space-x-2">
            <button
              *ngIf="!userStore.isAdmin"
              routerLink="profile/settings"
              class="primary rounded-3xl px-3 py-2 text-white"
            >
              Profile
            </button>
            <button *ngIf="userStore.isAdmin"
              routerLink="/dashboard/settings"
              class="primary rounded-3xl px-3 py-2 relative"
            >
              <span>Dashboard</span>
              <span 
                *ngIf="chatStore.notifications > 0" 
                class="absolute top-0.5 right-0 bg-red-500 rounded-full w-2 h-2"
              >
              </span>
            </button>
            <button (click)="logout()" class="primary rounded-3xl px-3 py-2">Sign out</button>
          </div>
        </div>
        <div *ngIf="!userStore.isAuthenticated" class="space-x-2">
          <button routerLink="/auth/login" class="primary rounded-3xl px-3 py-2">Log in</button>
          <button routerLink="/auth/signup" class="secondary rounded-3xl px-3 py-2">Sign up</button>
        </div>
      </div>
    </div>
  `
})
export default class Header {

  userStore = userStore
  chatStore = chatStore

  logout = async () => {
    await window.router.navigate(['/auth/login'])
    userStore.removeUser()
    ridesStore.setState(store => store.data = {})
    location.reload()
  }

}
