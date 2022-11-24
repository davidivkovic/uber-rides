import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'Banner',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="w-[275px] space-y-4 bg-[#f1f1f1] rounded-md p-5">
      <img
        src="https://d3i4yxtzktqr9n.cloudfront.net/riders-web-v2/853ebe0d95a62aca.svg"
        alt="A car on a road"
        class="w-full rounded"
      />
      <div>
        <h2 class="text-xl">Get a ride in minutes</h2>
        <p class="text-gray-500">Book an Uber from a web browser, no app installation required.</p>
      </div>
      <button routerLink="/" class="primary">Request a ride</button>
    </div>
  `
})

export default class Banner { }
