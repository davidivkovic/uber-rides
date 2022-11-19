import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Footer from '../../components/common/footer'

@Component({
  standalone: true,
  imports: [RouterOutlet, Footer],
  template: `
    <div
      class="flex justify-center"
      style="min-height: calc(100vh - 64px - 56px);"
    >
      <router-outlet></router-outlet>
    </div>
    <Footer></Footer>
  `
})
export default class FooterLayout {}
