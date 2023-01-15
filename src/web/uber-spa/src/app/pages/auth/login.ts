import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { NgForm, FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { userStore } from '@app/stores/userStore'
import SocialMedia from '../auth/components/socialMedia'
import auth from '@app/api/auth'

@Component({
  standalone: true,
  imports: [NgIf, FormsModule, SocialMedia, RouterModule],
  template: `
    <div class="flex-1 flex flex-col w-[320px] py-10 gap-4 mx-auto justify-center h-full">
      <div class="text-2xl ">What are your email and password?</div>
      <form
        ngNativeValidate
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
          placeholder="Enter your email address"
          class=""
        />
        <input
          ngModel
          #password="ngModel"
          required
          type="password"
          name="password"
          placeholder="Enter your password"
          class=""
        />
        <p class="text-red-600 text-center text-sm">{{ error }}</p>
        <button type="submit" class="primary block w-full ">Log in</button>
      </form>
      <SocialMedia></SocialMedia>
      <a href="/auth/password/forgotten" class="underline text-sm text-center cursor-pointer mt-2">
        Forgotten your password?
      </a>
      <small class="mt-3 ">
        By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated
        means, from Uber and its affiliates to the number provided.</small
      >
      <small class="mt-10">
        This site is protected by reCAPTCHA and the Google
        <span class="underline text-black"> Privacy Policy</span> and
        <span class="underline text-black">Terms of Service</span> apply
      </small>
    </div>
  `
})
export default class Index {
  error: string = ''
  userStore = userStore

  constructor(private router: Router) { }

  login = async (form: NgForm) => {
    this.error = ''
    if (!form.valid) return
    try {
      await auth.login({
        email: form.value.email,
        password: form.value.password
      })
      this.router.navigate(['/'])
    } catch (error) {
      this.error = error.message
    }
  }
}
