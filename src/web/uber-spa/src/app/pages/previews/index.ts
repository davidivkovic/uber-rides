import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModel } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex flex-col overflow-x-hidden">
      <div class="bg-black h-16 w-full flex items-center px-20 space-x-10">
        <a routerLink="/" class="p-2">
          <img
            alt="Uber logo"
            class="h-4"
            src="https://wbsdigital.co.za/wp-content/uploads/2020/07/uber-logo-white.png"
          />
        </a>
        <div class="space-x-6 text-[13px] font-medium">
          <a routerLink="/" class="text-white">Home</a>
          <a routerLink="/" class="text-white">Live support</a>
        </div>
      </div>
      <div class="w-screen flex justify-center items-center flex-1">
        <div class="flex flex-col  w-[300px] py-10 gap-3 justify-center">
          <div class="text-2xl">What's your phone number or email?</div>
          <form class="space-y-3 w-full">
            <input
              class="peer"
              required
              type="text"
              placeholder="Enter phone number or email"
            />

            <input
              required
              class="peer"
              type="password"
              placeholder="Enter password"
            />

            <button type="submit" class="primary block w-full">Continue</button>
            <button class="secondary block w-full">Cancel</button>
          </form>

          <label
            for="company-size"
            class="block text-sm font-medium text-gray-700"
            >Company size</label
          >
          <select name="company-size" id="company-size" class="!mt-2">
            <option value="">Please select</option>
            <option value="small">1 to 10 employees</option>
            <option value="medium">11 to 50 employees</option>
            <option value="large">50+ employees</option>
          </select>
          <div class="flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
            />
            <label
              for="terms-and-privacy"
              class="ml-2 block text-sm text-gray-900"
            >
              I agree to the Terms and Privacy policy</label
            >
          </div>
          <div
            class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]"
          >
            <span class="text-xs bg-white px-2 text-gray-400"> or </span>
          </div>
          <button
            class="secondary flex items-center justify-center space-x-2 h-[51px] mt-2"
          >
            <img
              alt="Google icon"
              class="h-4 w-4"
              src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            />
            <p>Continue with Google</p>
          </button>
          <button
            class="secondary flex items-center justify-center space-x-2 h-[51px]"
          >
            <img
              alt="Google icon"
              class="h-4 w-4"
              src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
            />
            <p>Continue with Facebook</p>
          </button>
          <small>
            By proceeding, you consent to get calls, WhatsApp or SMS messages,
            including by automated means, from Uber and its affiliates to the
            number provided.</small
          >
          <div id="code">
            <p class="mb-3 text-lg">
              Enter the 6-digit code sent to you at 062 8389925.
            </p>
            <form name="verify-code">
              <div class="flex space-x-2">
                <input
                  (paste)="handlePaste($event)"
                  (input)="handleInput($event)"
                  (keydown)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  type="text"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
                <input
                  (paste)="handlePaste($event)"
                  (keydown)="handleInput($event)"
                  (input)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  maxlength="1"
                  type="number"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
                <input
                  (paste)="handlePaste($event)"
                  (keydown)="handleInput($event)"
                  (input)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  maxlength="1"
                  type="number"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
                <input
                  (paste)="handlePaste($event)"
                  (input)="handleInput($event)"
                  (keydown)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  maxlength="1"
                  type="number"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
                <input
                  (paste)="handlePaste($event)"
                  (input)="handleInput($event)"
                  (keydown)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  maxlength="1"
                  type="number"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
                <input
                  (paste)="handlePaste($event)"
                  (input)="handleInput($event)"
                  (keydown)="handleInput($event)"
                  class="w-11 h-11 px-0 text-center"
                  maxlength="1"
                  type="number"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g, '$1').replace(/^0[^.]/, '0');"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Index {
  printHello = () => console.log('Test');

  handleInput = (e) => {
    const input = e.target;
    if (e.keyCode == 8 && input.previousElementSibling) {
      input.value = '';
      input.previousElementSibling.focus();
    } else if (input.nextElementSibling && input.value) {
      input.nextElementSibling.focus();
    }
  };
  handlePaste = (e) => {
    const inputs = document
      .querySelector('form[name="verify-code"]')
      .querySelectorAll('input');
    const paste = e.clipboardData.getData('text');
    console.log(paste);
    inputs.forEach((input, i) => {
      input.value = paste[i] || '';
    });
  };
}
