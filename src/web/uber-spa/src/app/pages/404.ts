import { Component } from '@angular/core'

@Component({
  standalone: true,
  template: `
    <div class="flex mx-auto w-[1100px] space-x-28">
      <div class="space-y-8 mt-14">
        <h1 class="text-4xl">Sorry, we couldn’t find that page</h1>
        <p class="text-gray-600">
          We have shifted a few things around, and your page must have gotten lost. Try retyping the
          address or just head back to our home page.
        </p>
        <div class="w-max">
          <a href="#" class="group block text-gray-600 transition">
            Go to Uber.com
            <span
              class="block max-w-0 group-hover:max-w-full z-10 transition-all duration-500 h-px bg-black"
            ></span>
          </a>
        </div>
      </div>
      <img
        class="w-[550px]"
        src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_837,h_1046/v1594147723/dotcom/page-not-found-desktop.jpg"
      />
    </div>
  `
})
export default class Page404 {}
