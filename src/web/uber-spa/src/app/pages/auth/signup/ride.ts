import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { Router } from '@angular/router'
import { NgForm, FormsModule } from '@angular/forms'

import SocialMedia from '../components/socialMedia'
import auth from '@app/api/auth'

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
          <div class="text-2xl">Personal information</div>
          <p class="text-gray-700">Let us know how to properly address you.</p>
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
          <div class="text-2xl">Additional information</div>
          <p class="text-gray-700">Tell us more information about yourself.</p>
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
      <SocialMedia class="w-full"></SocialMedia>
    </div>
  `
})
export class Index {
  error = ''
  constructor(public router: Router) { }

  signUp = async (form: NgForm) => {
    if (!form.valid) return
    try {
      await auth.signUp({
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        password: form.value.password,
        phoneNumber: form.value.phoneNumber,
        city: form.value.city,
        role: 'ROLE_RIDER'
      })
      this.router.navigate(['auth/signup/' + form.value.email])
    }
    catch (error) {
      this.error = error.message
    }
  }

}