import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
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
        <div class="space-x-2">
          <button routerLink="/login" class="primary rounded-3xl px-3 py-2">
            Log in
          </button>
          <button routerLink="/signup" class="secondary rounded-3xl px-3 py-2">
            Sign up
          </button>
        </div>
      </div>
    </div>
  `,
})
export default class Header {}
