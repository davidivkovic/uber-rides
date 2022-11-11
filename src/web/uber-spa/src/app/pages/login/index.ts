import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, FormsModule],
  template: ` <div
    class="flex-1 flex flex-col w-[320px] py-10 gap-3 mx-auto justify-center"
    style="min-height: calc(100vh - 56px)"
  >
    <div class="text-2xl">What's your phone number or email?</div>
    <form
      [formGroup]="loginForm"
      #ngForm="ngForm"
      (ngSubmit)="login()"
      class="space-y-3 w-full"
    >
      <input
        formControlName="username"
        required
        name="username"
        type="text"
        placeholder="Enter phone number or email"
      />
      <label
        *ngIf="username.invalid && ngForm.submitted"
        class="text-red-600 text-sm -mt-5"
      >
        Please enter a phone number or email
      </label>
      <input
        formControlName="password"
        required
        type="password"
        name="password"
        placeholder="Enter password"
      />
      <label
        *ngIf="password.invalid && ngForm.submitted"
        class=" text-red-600 text-sm -mt-5"
      >
        Please enter password
      </label>
      <button type="submit" class="primary block w-full">Log in</button>
    </form>

    <div class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]">
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
    <small class="mt-3">
      By proceeding, you consent to get calls, WhatsApp or SMS messages,
      including by automated means, from Uber and its affiliates to the number
      provided.</small
    >
    <small class="mt-20">
      This site is protected by reCAPTCHA and the Google
      <span class="underline text-black"> Privacy Policy</span> and
      <span class="underline text-black">Terms of Service</span> apply
    </small>
  </div>`,
})
export class Index {
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  login = () => {
    console.log(console.log(this.loginForm.value));
  };
}
