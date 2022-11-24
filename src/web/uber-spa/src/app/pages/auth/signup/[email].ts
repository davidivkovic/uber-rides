import { Component, ElementRef, ViewChild } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { NgForm, FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Dialog } from '@app/components/ui/dialog'
import { CloseButton } from '@app/components/ui/base/closeButton'
import { dialogStore } from '@app/stores'
import auth from '@app/api/auth'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterModule],
  template: ` 
    <div class="h-full flex items-center justify-center">
      <div class="w-[340px]">
        <p class="mb-3 text-2xl">
          Enter the 6-digit code sent to you at {{ email }}.
        </p>
        <form
          ngNativeValidate
          #verificationForm="ngForm"
          (ngSubmit)="verify(verificationForm)"
          name="verify-code"
        >
          <div class="flex justify-between w-full">
            <input
              required
              *ngFor="let number of [0, 1, 2, 3, 4, 5]; trackBy: ngForIdentity"
              ngModel
              #number="ngModel"
              [name]="'input' + number"
              (paste)="handlePaste($event)"
              (keydown)="handleInput($event)"
              class="w-12 h-12 px-0 text-center text-base"
              type="text"
              oninput="this.value =
                this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g,'$1').replace(/^0[^.]/, '0');
              "
            />
          </div>
          <label
            *ngIf="error"
            class="text-red-600 flex justify-center text-sm mt-4"
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
export class EmailVerification {
  @ViewChild('verificationForm') codeForm: NgForm
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>

  email = ''
  error = ''

  constructor(public rotuer: Router, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.email = params.get('email')
    })
  }

  ngForIdentity = (index: number, item: any) => item.index;

  handleInput = (e: KeyboardEvent) => {
    const input = e.target as HTMLInputElement
    if (e.code === 'Backspace') {
      input.value = ''
      if (input.previousElementSibling) {
        const previousSibling = input.previousElementSibling as HTMLElement
        previousSibling.focus()
      }
    } else if (Number(e.key)) {
      input.value = Number(e.key).toString()
      if (input.nextElementSibling) {
        const nextSibling = input.nextElementSibling as HTMLElement
        nextSibling.focus()
      }
    }
  }

  handlePaste = (e: ClipboardEvent) => {
    const paste = e.clipboardData.getData('text')
    console.log(paste)
    Object.keys(this.codeForm.value).forEach((key, i) => {
      const value = paste[i] || ''
      this.codeForm.controls[key].setValue(value)
    })
  }

  verify = async (form: NgForm) => {
    if (!form.valid) return
    const code = Object.values(form.value).join('')
    try {
      await auth.confirmEmail({ email: this.email, code})
      dialogStore.openDialog(
        CodeStatusDialog,
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
      CodeStatusDialog,
      {
        success,
        title,
        body
      }
    )
  }
}

@Component({
  standalone: true,
  imports: [NgIf, CloseButton],
  template: `
    <div class="space-y-5 px-6 py-5 max-w-md text-center">
      <CloseButton (click)="close()" class="absolute right-2 top-2"></CloseButton>
      <div class="space-y-2">
        <svg 
          *ngIf="data.props?.success" 
          class="inline-flex justify-center" 
          width="72" height="72" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M9 12l2 2l4 -4"></path>
        </svg>
        <h2 class="text-2xl font-normal">
          {{ data.props.title }}
        </h2>
        <p class="text-gray-800">{{ data.props.body }}</p>
      </div>
      <form method="dialog" class="flex justify-center">
        <button type="button" (click)="close('ok')" class="primary mt-3">Continue</button>
      </form>
    </div>
  `
})
class CodeStatusDialog extends Dialog {}
