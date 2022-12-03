import { Component, ElementRef, ViewChild } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { dialogStore } from '@app/stores'
import auth from '@app/api/auth'
import { CodeInputs } from '../components/code'
import { ContinueDialog } from '../components/continueDialog'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, CodeInputs],
  template: ` 
    <div class="h-full flex items-center justify-center">
      <div class="w-[340px]">
        <form
          ngNativeValidate
          (submit)="verify($event)"
          name="verify-code"
        >
          <CodeInputs [email]="email"></CodeInputs>
          <label
            *ngIf="error"
            class="text-red-600 flex justify-center text-sm mt-4 text-center"
          >
            {{ error }}
          </label>
          <button type="submit" class="primary w-full mt-4">
            Verify account
          </button>
          <div class="mx-auto w-fit mt-3">
            Haven't received a code?
            <span (click)="resendCode()" class="underline cursor-pointer">
              Click to resend.
            </span>
          </div>
        </form>
      </div>
    </div>
  `
})
export default class EmailVerification {
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>

  email = ''
  error = ''

  constructor(public rotuer: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.email = params.get('email')
    })
  }

  getCode = (form: object) => {
    let code = ''
    for (const [key, value] of Object.entries(form)) {
      if (key.includes('number')) code += value
     }
     return code
  }

  verify = async (event: Event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.target as HTMLFormElement).entries())
    const code = this.getCode(form)
    
    try {
      await auth.confirmEmail({ email: this.email, code:code })
      dialogStore.openDialog(
        ContinueDialog,
        {
          success: true,
          title: 'Success',
          body: 'Your account has been successfully verified. You will be redirected to the login page.'
        },
        () => setTimeout(() => this.rotuer.navigate(['auth/login']), 200)
      )
    }
    catch (error) {
      this.error = error.message
    }
  }

  resendCode = async () => {

    let success: boolean
    let title: string
    let body: string

    try {
      title = 'New code sent'
      body = await auth.resendConfirmation(this.email)
      success = true
    }
    catch (error) {
      title = 'Oops!'
      body = error.message
    }

    dialogStore.openDialog(
      ContinueDialog,
      {
        success,
        title,
        body
      }
    )
  }
}