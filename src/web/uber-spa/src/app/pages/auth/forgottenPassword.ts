import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import auth from '@app/api/auth'
import { dialogStore } from '@app/stores'
import { ContinueDialog } from './components/continueDialog'

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <form
      ngNativeValidate
      #form="ngForm"
      (ngSubmit)="resetPassword()"
      class="flex-1 flex flex-col w-[320px] py-10 space-y-3 mx-auto justify-center h-full"
    >
      <div class="text-2xl ">Trouble with logging in?</div>
      <p class="text-gray-500">
        Enter your email address and we'll send you a link to get back into your account.
      </p>
      <input [(ngModel)]="email" required name="email" type="text" placeholder="Enter email" />
      <p class="text-red-600 text-center text-sm">{{ error }}</p>
      <button type="submit" class="primary">Send login code</button>
      <div class="w-full h-[18px] border-b border-gray-400 text-center pt-[2px]">
        <span class="text-xs bg-white px-2 text-gray-400 "> or </span>
      </div>
      <a href="/auth/signup" class="underline text-center cursor-pointer mt-2">
        Create a new account
      </a>
    </form>
  `
})
export default class ForgottenPassword {
  error: string = ''
  email: string = ''

  constructor(private router: Router) {}

  resetPassword = async () => {
    console.log(this.email)
    this.error = ''
    try {
      const message = await auth.forgottenPassword(this.email)
      dialogStore.openDialog(
        ContinueDialog,
        {
          success: true,
          title: 'Code sent',
          body: message
        },
        () =>
          setTimeout(() => {
            this.router.navigate([`/auth/${this.email}/reset`])
          }, 200)
      )
    } catch (error) {
      this.error = error.message
    }
  }
}
