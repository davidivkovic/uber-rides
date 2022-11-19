import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { NgForm, FormsModule } from '@angular/forms'
import SocialMedia from '../auth/components/socialMedia'

@Component({
  standalone: true,
  imports: [NgIf, FormsModule, SocialMedia],
  template: ` <div
    class="flex-1 flex flex-col w-[320px] py-10 gap-4 mx-auto justify-center h-full"
  >
    <div class="text-2xl ">What are your email and password?</div>
    <form
      #loginForm="ngForm"
      (ngSubmit)="login(loginForm)"
      class="space-y-3 w-full"
    >
      <input
        ngModel
        #email="ngModel"
        required
        name="email"
        type="text"
        placeholder="Enter email"
        class=""
      />
      <label
        *ngIf="!email.value && loginForm.submitted"
        class="text-red-600 text-sm -mt-5 "
      >
        Please enter an email
      </label>
      <input
        ngModel
        #password="ngModel"
        required
        type="password"
        name="password"
        placeholder="Enter password"
        class=""
      />
      <label
        *ngIf="!password.value && loginForm.submitted"
        class=" text-red-600 text-sm -mt-5 "
      >
        Please enter password
      </label>
      <p class="text-red-600 text-sm">{{ loginError }}</p>
      <button type="submit" class="primary block w-full ">Log in</button>
    </form>
    <SocialMedia></SocialMedia>
    <small class="mt-3 ">
      By proceeding, you consent to get calls, WhatsApp or SMS messages,
      including by automated means, from Uber and its affiliates to the number
      provided.</small
    >
    <small class="mt-20 ">
      This site is protected by reCAPTCHA and the Google
      <span class="underline text-black"> Privacy Policy</span> and
      <span class="underline text-black">Terms of Service</span> apply
    </small>
  </div>`
})
export class Index {
  loginError: string = ''

  login = (form: NgForm) => {
    this.loginError = ''
    if (form.valid) {
      console.log(console.log(form.value))
    }
  }
}