import { Component } from '@angular/core'
import { RouterLink, RouterModule } from '@angular/router'
@Component({
  selector: 'Banner',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="w-[275px] h-full space-y-4">
      <img
        src="https://d3i4yxtzktqr9n.cloudfront.net/riders-web-v2/853ebe0d95a62aca.svg"
        alt="A car on a road"
        class="w-full"
      />
      <div>
        <h2 class="text-xl">Get a trip in minutes</h2>
        <p class="text-gray-400">Book an Uber from a web browser, no app installation required.</p>
        </div>
        <button routerLink="/" class="primary">Request a trip</button>
    </div>
  `
})
export default class Banner {}
