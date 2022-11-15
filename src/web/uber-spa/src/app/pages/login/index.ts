import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { NgForm, FormsModule } from '@angular/forms'
import { MyDialog } from 'src/app/components/ui/dialog'
import { dialogStore } from 'src/app/stores'

declare let FB: any

@Component({
  standalone: true,
  imports: [NgIf, FormsModule],
  template: ` <div
    class="flex-1 flex flex-col w-[320px] py-10 gap-3 mx-auto justify-center h-full"
  >
    <div class="text-2xl system-font">What's your phone number or email?</div>
    <form
      #loginForm="ngForm"
      (ngSubmit)="login(loginForm)"
      class="space-y-3 w-full"
    >
      <input
        ngModel
        #username="ngModel"
        required
        name="username"
        type="text"
        placeholder="Enter phone number or email"
        class="system-font"
      />
      <label
        *ngIf="!username.value && loginForm.submitted"
        class="text-red-600 text-sm -mt-5 system-font"
      >
        Please enter a phone number or email
      </label>
      <input
        ngModel
        #password="ngModel"
        required
        type="password"
        name="password"
        placeholder="Enter password"
        class="system-font"
      />
      <label
        *ngIf="!password.value && loginForm.submitted"
        class=" text-red-600 text-sm -mt-5 system-font"
      >
        Please enter password
      </label>
      <button type="submit" class="primary block w-full system-font">
        Log in
      </button>
    </form>

    <div class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]">
      <span class="text-xs bg-white px-2 text-gray-400 system-font"> or </span>
    </div>
    <button
      class="secondary flex items-center justify-center space-x-2 h-[51px] mt-2 system-font"
    >
      <img
        alt="Google icon"
        class="h-4 w-4"
        src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
      />
      <p class="system-font">Continue with Google</p>
    </button>
    <button
      (click)="loginWithFacebook()"
      class="secondary flex items-center justify-center space-x-2 h-[51px]"
    >
      <img
        alt="Google icon"
        class="h-4 w-4"
        src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
      />
      <p class="system-font">Continue with Facebook</p>
    </button>
    <small class="mt-3 system-font">
      By proceeding, you consent to get calls, WhatsApp or SMS messages,
      including by automated means, from Uber and its affiliates to the number
      provided.</small
    >
    <small class="mt-20 system-font">
      This site is protected by reCAPTCHA and the Google
      <span class="underline text-black"> Privacy Policy</span> and
      <span class="underline text-black">Terms of Service</span> apply
    </small>
  </div>`
})
export class Index {

  constructor() {
    if (document.getElementById('facebook-jssdk')) return

    const script = Object.assign(document.createElement('script'), {
      src: 'https://connect.facebook.net/en_US/sdk.js',
      async: true,
      id: 'facebook-jssdk',
      onload: this.fbInit
    })
    document.head.appendChild(script)
  }

  fbInit = () => {
    FB.init({
      appId: '1762946884038679',
      cookie: false,
      xfbml: true,
      version: 'v2.4'
    })
  }

  login = (form: NgForm) => {
    console.log(console.log(form.valid))
  }

  loginWithFacebook = () => {
    FB.login((response: any) => {
      if (response.status === 'connected') {
        console.log(response.authResponse)
      } else {
        console.log(response)
      }
    })
  }
}
