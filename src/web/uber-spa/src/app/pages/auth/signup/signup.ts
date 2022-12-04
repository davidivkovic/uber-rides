import { Component, Input } from '@angular/core'
import { NgIf } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { NgForm, FormsModule } from '@angular/forms'

import SocialMedia from '../components/socialMedia'
import auth from '@app/api/auth'
import { userStore } from '@app/stores'

@Component({
  standalone: true,
  imports: [NgIf, FormsModule, SocialMedia],
  template: `
    <div class="h-full w-[420px] space-y-4  py-4 mx-auto flex flex-col items-center justify-center">
      <form
        ngNativeValidate
        #signUpForm="ngForm"
        (ngSubmit)="signUp(signUpForm)"
        class="space-y-10"
      >
        <div>
          <div *ngIf="userStore.isAdmin" class="text-3xl">Registration of a new driver</div>
          <div class="text-xl mt-5">Personal information</div>
          <p *ngIf="!userStore.isAdmin" class="text-gray-700">Let us know how to properly address you.</p>
          <div class="flex w-full space-x-5 mt-5">
            <input
              required
              ngModel
              #firstName="ngModel"
              name="firstName"
              type="text"
              placeholder="Enter first name"
            />
            <input
              required
              ngModel
              #lastName="ngModel"
              name="lastName"
              type="text"
              placeholder="Enter last name"
            />
          </div>
          <div class="flex flex-col w-full space-y-5 mt-5">
            <input
              required
              ngModel
              #email="ngModel"
              type="email"
              name="email"
              placeholder="Enter email"
            />
            <input
              required
              ngModel
              #password="ngModel"
              name="password"
              type="password"
              placeholder="Enter password"
            />
          </div>
        </div>
        <div>
          <div class="text-xl">Additional information</div>
          <p *ngIf="!userStore.isAdmin" class="text-gray-700">Tell us more information about yourself.</p>
          <div class="flex w-full space-x-5 mt-3">
            <input
              required
              ngModel
              #phoneNumber="ngModel"
              type="tel"
              [minLength]="10"
              name="phoneNumber"
              placeholder="Enter mobile number"
            />
            <input
              required
              ngModel
              #city="ngModel"
              name="city"
              type="text"
              placeholder="Enter city"
            />
          </div>
        </div>
        <div class="space-y-4">
          <p
            *ngIf="!signUpForm.valid && signUpForm.submitted"
            class="text-sm text-center text-red-600"
          >
            All fields are required
          </p>
          <p
            *ngIf="error"
            class="text-sm text-center text-red-600"
          >
            {{ error }}
          </p>
          <button class="primary w-full">Sign up</button>
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

  constructor(public router: Router, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.toString().includes('drive') && (this.role = 'ROLE_DRIVER')
  }

  signUp = async (form: NgForm) => {
    if (!form.valid) return
    try {
      this.error = ''
      const userId = await auth.signUp({
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        password: form.value.password,
        phoneNumber: form.value.phoneNumber,
        city: form.value.city,
        role: this.role
      })
      console.log(userId)
      let path
      if(this.role === 'ROLE_DRIVER') {
        path = `auth/signup/${userId}/car`
      }
      else {
        path = 'auth/signup/' + form.value.email
      }
      this.router.navigate([path])
    }
    catch (error) {
      this.error = error.message
    }
  }

}