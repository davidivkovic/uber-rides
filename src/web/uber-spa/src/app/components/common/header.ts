import { Component } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { NgIf } from '@angular/common'
import { userStore } from '@app/stores/userStore'

@Component({
  selector: 'Header',
  standalone: true,
  imports: [RouterModule, NgIf],
  template: `
    <div class="bg-black h-16 w-full flex justify-center">
      <div class="w-[1280px] flex items-center justify-between mx-auto text-sm">
        <div class="flex space-x-5 items-center">
          <a routerLink="/" class="p-2">
            <img
              alt="Uber logo"
              class="h-4"
              src="https://wbsdigital.co.za/wp-content/uploads/2020/07/uber-logo-white.png"
            />
          </a>
          <div>
            <button routerLink="/" class="primary rounded-3xl px-3 py-2">
              Home
            </button>
            <button class="primary rounded-3xl px-3 py-2">Live support</button>
          </div>
        </div>
        <div *ngIf="userStore.isAuthenticated; else loginButtons" class="space-x-2">
          <div class="flex space-x-2">
            <button
              routerLink="profile/settings"
              class="primary rounded-3xl px-3 py-2"
            >
              Settings
            </button>
            <button (click)="logout()" class="primary rounded-3xl px-3 py-2">
              Sign out
            </button>
          </div>
        </div>
        <ng-template #loginButtons>
          <div class="space-x-2">
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
        </ng-template>
      </div>
    </div>`   
})

export default class Header {
  isAuthenticated = false
  userStore = userStore

  constructor(private router: Router) { }

  logout = () => {
    userStore.removeUser()
    this.router.navigate(['/'])
  }
}
