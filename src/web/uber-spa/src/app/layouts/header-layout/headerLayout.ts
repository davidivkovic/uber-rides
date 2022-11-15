import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Header from '../components/header'
import FooterComponent from '../components/footer'

@Component({
  standalone: true,
  imports: [RouterOutlet, Header, FooterComponent],
  template: `
    <Header></Header>
    <div class="flex justify-center" style="min-height: calc(100vh - 64px);">
      <router-outlet></router-outlet>
    </div>
  `
})
export default class HeaderLayout {}
