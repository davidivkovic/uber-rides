import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import HeaderComponent from '../components/header';
import FooterComponent from '../components/footer';

@Component({
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div
      class="flex justify-center"
      style="min-height: calc(100vh - 64px - 56px);"
    >
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
})
export default class MainLayout {}
