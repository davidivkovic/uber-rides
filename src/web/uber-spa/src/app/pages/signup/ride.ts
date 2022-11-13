import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<div class="h-full flex items-center justify-center">
    <div class="w-[400px] space-y-10">
      <div>
        <h2 class="text-2xl  system-font">Personal information</h2>
        <p class="text-gray-700 system-font">
          Let us know how to properly address you.
        </p>
        <div class="flex w-full space-x-5 mt-3">
          <input
            type="text"
            class="system-font"
            placeholder="Enter first name"
          />
          <input type="text" class="system-font" placeholder="Enter surname" />
        </div>
        <div class="flex flex-col w-full space-y-5 mt-5">
          <input type="email" class="system-font" placeholder="Enter email" />
          <input
            type="password"
            class="system-font"
            placeholder="Enter password"
          />
        </div>
      </div>
      <div>
        <h2 class="text-2xl  system-font">Additional information</h2>
        <p class="text-gray-700 system-font">
          Define how you're going to log in
        </p>
        <div class="flex w-full space-x-5 mt-3">
          <input type="email" class="system-font" placeholder="Mobile number" />
          <input type="password" class="system-font" placeholder="Enter city" />
        </div>
      </div>
      <button class="primary w-full system-font">Sign up</button>
    </div>
  </div>`,
})
export class Index {}
