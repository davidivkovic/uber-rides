import { Component, NgZone } from '@angular/core'
import { NgIf } from '@angular/common'
import { Router } from '@angular/router'
import * as googleOneTap from 'google-one-tap'
import auth from '@app/api/auth'

declare const google: typeof googleOneTap

@Component({
  selector: 'SocialMedia',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="w-full">
      <div class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]">
        <span class="text-xs bg-white px-2 text-gray-400 "> or </span>
      </div>
      <div class="space-y-2 mt-6">
        <button 
          (click)="loginWithGoogle()"
          class="secondary relative w-full flex items-center justify-center space-x-2 h-[51px]"
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
      <label
        *ngIf="error"
        class="text-red-600 text-center flex text-sm mt-4"
        >
          {{ error }}
      </label>
    </div>
  `
})
export default class SocialMedia {

  error = ''

  constructor(public router: Router, public zone: NgZone) { }

  async ngAfterViewInit() {
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
    google.accounts.id.initialize({
      client_id: '152138799418-rdah02vercon3q3p9ubkh4jqa5vflpcr.apps.googleusercontent.com',
      callback: this.handleCredentialResponse
    })
  }

  fbInit = () => {
    FB.init({
      appId: '828866315100669',
      cookie: false,
      xfbml: true,
      frictionlessRequests: true,
      version: 'v2.4'
    })
  }

  loginWithGoogle = () => {
    /* Reset google one tap cooldown */
    document.cookie = 'g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
    google.accounts.id.prompt()
  }

  handleCredentialResponse = async (response: google.CredentialResponse) => {
    try {
      this.error = ''
      const registrationCompleted = await auth.googleLogin(response.credential)
      if (registrationCompleted) {
        this.navigate('/')
      }
      else {
        // Navigate the user to the 'Please complete signup/registration page'
        // Remove the line below when done
        this.navigate('/profile/settings')
      }
    }
    catch (error) {
      this.error = error.message
    }
  }

  loginWithFacebook = () => {
    this.error = ''
    FB.login(
      async (response: facebook.StatusResponse) => {
        if (response.status !== 'connected') {
          this.error = 'Could not continue with facebook at this moment.'
          return
        }
        try {
          const registrationCompleted = await auth.facebookLogin(
            response.authResponse.userID,
            response.authResponse.accessToken
          )
          if (registrationCompleted) {
            this.navigate('/')
          }
          else {
            // Navigate the user to the 'Please complete signup/registration page'
            // Remove the line below when done
            this.navigate('/profile/settings')
          }
        }
        catch (error) {
          this.error = error.message
        }
      },
      {
        scope: 'email'
      }
    )
  }

  navigate = (...fragments: string[]) => {
    this.zone.run(() => this.router.navigate(fragments))
  }
}