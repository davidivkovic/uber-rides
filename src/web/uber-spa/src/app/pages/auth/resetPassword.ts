import { Component } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CodeInputs } from './components/code'
import { NgIf } from '@angular/common'
import auth from '@app/api/auth'
import { dialogStore } from '@app/stores'
import { ContinueDialog } from './components/continueDialog'

@Component({
  standalone: true,
  imports: [CodeInputs, RouterModule, NgIf],
  template: `
    <div class="h-full flex items-center justify-center">
      <div class="w-[340px]">
        <form ngNativeValidate
        (submit)="reset($event)">
          <CodeInputs [email]="email"></CodeInputs>
          <div class="mt-10">
            <p class="mb-3 text-xl">Enter your new password</p>
            <input required type="password" name="password" />
          </div>
          <label *ngIf="error" class="text-red-600 flex justify-center text-sm mt-4 text-center">
            {{ error }}
          </label>
          <button type="submit" class="primary w-full mt-5">Reset password</button>
        </form>
      </div>
    </div>
  `
})
export default class ResetPassword {
  email = ''
  error = ''

  constructor(public router: Router, public route: ActivatedRoute) { }

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

  reset = async (event: Event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.target as HTMLFormElement).entries())
    const code = this.getCode(form)
    const password = form['password'].toString()

    try {
      this.error = ''
      await auth.resetPassword({ email: this.email, code, password })
      dialogStore.openDialog(
        ContinueDialog,
        {
          success: true,
          title: 'Success',
          body: 'Your account has been successfully verified. You will be redirected to the login page.'
        },
        () => setTimeout(() => this.router.navigate(['auth/login']), 200)
      )

    }
    catch (error) {
      this.error = error
    }
  }
}
