import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgIf } from '@angular/common'
import { userStore } from '@app/stores/userStore'

@Component({
  selector: 'Header',
  standalone: true,
  imports: [RouterModule, NgIf],
  template: `
    <div class="bg-black h-14 w-full flex justify-center">
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
            <button routerLink="/" class="primary text-base rounded-3xl px-3 py-2 text-white">
              Home
            </button>
            <button class="primary !text-base rounded-3xl px-3 py-2">Live support</button>
            <button *ngIf="userStore.isAdmin" routerLink="/auth/signup/drive" class="primary text-base rounded-3xl px-3 py-2 text-white">
              New driver
            </button>
          </div>
        </div>
        <div *ngIf="userStore.isAuthenticated" class="space-x-2">
          <div class="flex space-x-2">
            <button
              routerLink="profile/settings"
              class="primary text-base rounded-3xl px-3 py-2 text-white"
            >
              Settings
            </button>
            <button (click)="logout()" class="primary !text-base rounded-3xl px-3 py-2">
              Sign out
            </button>
          </div>
        </div>
        <div *ngIf="!userStore.isAuthenticated" class="space-x-2">
          <button
            routerLink="/auth/login"
            class="primary rounded-3xl px-3 py-2"
          >
            Log in
          </button>
          <button
            routerLink="/auth/signup"
            class="secondary rounded-3xl px-3 py-2"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  `
})

export default class Header {
  userStore = userStore

  logout = () => {
    userStore.removeUser()
    location.href = '/'
  }
}
