import { Component } from '@angular/core'

declare let FB: any
declare let google: any

@Component({
  selector: 'SocialMedia',
  standalone: true,
  template: `
    <div class="w-full">
      <div
        class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]"
      >
        <span class="text-xs bg-white px-2 text-gray-400 "> or </span>
      </div>
      <div class="space-y-2 mt-6">
        <button
          (click)="loginWithGoogle()"
          class="secondary w-full flex items-center justify-center space-x-2 h-[51px]"
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
          class="secondary w-full flex items-center justify-center space-x-2 h-[51px]"
        >
          <img
            alt="Google icon"
            class="h-4 w-4"
            src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
          />
          <p class="">Continue with Facebook</p>
        </button>
      </div>
    </div>
  `
})
export default class SocialMedia {
  googleClient: any
  accessToken: any

  constructor() {
    this.addGoogleScript()
    this.addFacebookScript()
  }

  addGoogleScript = () => {
    if (document.getElementById('google-login')) {
      this.googleInit()
      return
    }
    const script = Object.assign(document.createElement('script'), {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      id: 'google-login',
      onload: this.googleInit
    })
    document.head.appendChild(script)
  }

  addFacebookScript = () => {
    if (document.getElementById('facebook-jssdk')) {
      this.fbInit()
      return
    }
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
