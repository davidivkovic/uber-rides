import { Component } from '@angular/core'

@Component({
  standalone: true,
  template: `<div class="h-full flex items-center justify-center">
    <div class="w-[400px] space-y-10">
      <div>
        <h2 class="text-2xl">Personal information</h2>
        <p class="text-gray-700 ">Let us know how to properly address you.</p>
        <div class="flex w-full space-x-5 mt-3">
          <input type="text" placeholder="Enter first name" />
          <input type="text" placeholder="Enter surname" />
        </div>
        <div class="flex flex-col w-full space-y-5 mt-5">
          <input type="email" placeholder="Enter email" />
          <input type="password" placeholder="Enter password" />
        </div>
      </div>
      <div>
        <h2 class="text-2xl">Additional information</h2>
        <p class="text-gray-700 ">Define how you're going to log in</p>
        <div class="flex w-full space-x-5 mt-3">
          <input type="email" placeholder="Mobile number" />
          <input type="password" placeholder="Enter city" />
        </div>
      </div>
      <button class="primary w-full">Sign up</button>
    </div>
  </div>`
})
export class Index {}
