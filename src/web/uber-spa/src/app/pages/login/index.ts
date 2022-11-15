import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { NgForm, FormsModule } from '@angular/forms'

declare let FB: any
declare let google: any

@Component({
  standalone: true,
  imports: [NgIf, FormsModule],
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

    <div class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]">
      <span class="text-xs bg-white px-2 text-gray-400 "> or </span>
    </div>
    <button
      (click)="loginWithGoogle()"
      class="secondary flex items-center justify-center space-x-2 h-[51px] mt-2 "
    >
      <img
        alt="Google icon"
        class="h-4 w-4"
        src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
      />
      <p class="">Continue with Google</p>
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
      <p class="">Continue with Facebook</p>
    </button>
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

  googleClient: any
  accessToken: any

  constructor() {
    this.addGoogleScript()
    this.addFacebookScript()
  }

  addGoogleScript = () => {
    if (document.getElementById('google-login')) return
    const script = Object.assign(document.createElement('script'), {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      id: 'google-login',
      onload: this.googleInit
    })
    document.head.appendChild(script)
  }

  addFacebookScript = () => {
    if (document.getElementById('facebook-jssdk')) return
    const script = Object.assign(document.createElement('script'), {
      src: 'https://connect.facebook.net/en_US/sdk.js',
      async: true,
      id: 'facebook-jssdk',
      onload: this.fbInit
    })
    document.head.appendChild(script)
  }

  googleInit = () => {
    this.googleClient = google.accounts.oauth2.initTokenClient({
      client_id:
        '152138799418-rdah02vercon3q3p9ubkh4jqa5vflpcr.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      callback: (tokenResponse: any) => {
        this.accessToken = this.handleCredentialResponse(
          tokenResponse.access_token
        )
      }
    })
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
    console.log(this.accessToken)

    this.loginError = ''
    if (form.valid) {
      console.log(console.log(form.value))
    }
  }

  loginWithGoogle = () => {
    this.googleClient.requestAccessToken()
  }

  handleCredentialResponse = (accessToken: any) => {
    console.log(accessToken)
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
