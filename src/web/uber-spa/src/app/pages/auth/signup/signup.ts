import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { NgForm, FormsModule } from '@angular/forms'

import SocialMedia from '../components/socialMedia'
import auth from '@app/api/auth'
import { userStore } from '@app/stores'

@Component({
  standalone: true,
  imports: [NgIf, FormsModule, SocialMedia],
  selector: 'Signup',
  template: `
    <div class="h-full w-[420px] space-y-4  py-4 mx-auto flex flex-col items-center justify-center">
      <form ngNativeValidate (submit)="signUp($event)" class="space-y-10">
        <div>
          <div *ngIf="userStore.isAdmin" class="text-3xl">Register a new driver</div>
          <div class="text-xl mt-5">Personal information</div>
          <p *ngIf="!userStore.isAdmin" class="text-gray-700">
            Let us know how to properly address you.
          </p>
          <div class="flex w-full space-x-5 mt-5">
            <input
              required
              name="firstName"
              type="text"
              placeholder="Enter first name"
              [(ngModel)]="firstName"
            />
            <input
              required
              name="lastName"
              type="text"
              placeholder="Enter last name"
              [(ngModel)]="lastName"
            />
          </div>
          <div class="flex flex-col w-full space-y-5 mt-5">
            <input
              required
              type="email"
              name="email"
              placeholder="Enter email"
              [(ngModel)]="email"
            />
            <input
              required
              name="password"
              type="password"
              placeholder="Enter password"
              [(ngModel)]="password"
            />
          </div>
        </div>
        <div>
          <div class="text-xl">Additional information</div>
          <p *ngIf="!userStore.isAdmin" class="text-gray-700">
            Tell us more information about yourself.
          </p>
          <div class="flex w-full space-x-5 mt-3">
            <input
              required
              type="tel"
              [minLength]="10"
              name="phoneNumber"
              placeholder="Enter mobile number"
              [(ngModel)]="phoneNumber"
            />
            <input required name="city" type="text" placeholder="Enter city" [(ngModel)]="city" />
          </div>
        </div>
        <div class="space-y-4">
          <p *ngIf="error" class="text-sm text-center text-red-600">
            {{ error }}
          </p>
          <button type="submit" class="primary w-full">Sign up</button>
        </div>
      </form>
      <SocialMedia *ngIf="!userStore.isAdmin" class="w-full"></SocialMedia>
    </div>
  `
})
export default class Index {
  error = ''
  role = 'ROLE_RIDER'
  userStore = userStore

  firstName = ''
  lastName = ''
  email = ''
  password = ''
  phoneNumber = ''
  city = ''

  constructor(public router: Router, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.toString().includes('drive') && (this.role = 'ROLE_DRIVER')
  }

  signUp = async (event: Event) => {
    event.preventDefault()
    try {
      this.error = ''
      const userId = await auth.signUp({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber,
        city: this.city,
        role: this.role
      })
      let path
      if (this.role === 'ROLE_DRIVER') {
        path = `auth/signup/${userId}/car`
      } else {
        path = 'auth/signup/' + this.email
      }
      this.router.navigate([path])
    } catch (error) {
      this.error = error.message
    }
  }
}
