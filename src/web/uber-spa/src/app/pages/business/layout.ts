import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Footer from '../../components/common/footer'

@Component({
  standalone: true,
  imports: [RouterOutlet, Footer],
  template: `
    <div class="flex flex-col h-full">
      <router-outlet></router-outlet>
      <Footer></Footer>
    </div>
  `
})
export default class Layout { }
