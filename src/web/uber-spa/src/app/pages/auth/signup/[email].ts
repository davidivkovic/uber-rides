import { Component, ElementRef, ViewChild } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { NgForm, FormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Dialog } from 'src/app/components/ui/dialog/index'
import { dialogStore } from 'src/app/stores'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterModule],
  template: ` <div class="h-full flex items-center justify-center">
    <div class="w-[340px]">
      <p class="mb-3 text-2xl ">
        Enter the 6-digit code sent to you at {{ email }}.
      </p>
      <form
        #verificationForm="ngForm"
        (ngSubmit)="verify(verificationForm)"
        name="verify-code"
      >
        <div class="flex justify-between w-full">
          <input
            required=""
            *ngFor="let number of [0, 1, 2, 3, 4, 5]; trackBy: ngForIdentity"
            ngModel
            #number="ngModel"
            [name]="'input' + number"
            (paste)="handlePaste($event)"
            (keydown)="handleInput($event)"
            class="w-12 h-12 px-0 text-center
          "
            type="text"
            oninput="this.value =
          this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g,
          '$1').replace(/^0[^.]/, '0');"
          />
        </div>
        <label
          *ngIf="!verificationForm.valid && verificationForm.submitted"
          class="text-red-600 text-sm"
        >
          The passcode you've entered is incorrect
        </label>
        <button type="submit" class="primary w-full mt-5">
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
  </div>`
})
export class EmailVerification {
  @ViewChild('verificationForm') codeForm: NgForm
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>

  email: string = ''

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.email = params.get('email')
    })
  }

  ngForIdentity = (index: number, item: any) => item.index;

  handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    e.preventDefault()
    if ((e as KeyboardEvent).code === 'Backspace') {
      input.value = ''
      if (input.previousElementSibling) {
        const previousSibling = input.previousElementSibling as HTMLElement
        previousSibling.focus()
      }
    } else if (Number((e as KeyboardEvent).key)) {
      input.value = Number((e as KeyboardEvent).key).toString()
      if (input.nextElementSibling) {
        const nextSibling = input.nextElementSibling as HTMLElement
        nextSibling.focus()
      }
    }
  }
  handlePaste = (e: ClipboardEvent) => {
    const paste = e.clipboardData.getData('text')
    Object.keys(this.codeForm.value).forEach((key, i) => {
      const value = paste[i] || ''
      this.codeForm.controls[key].setValue(value)
    })
  }

  verify = (form: NgForm) => {
    if (form.valid) {
      const code = Object.values(form.value).join('')
      console.log({ code, email: this.email })
    }
  }

  resendCode = () => {
    console.log({ email: this.email })

    // on successful
    const successful = false
    let resentStatusTitle: string
    let resendStatusBody: string

    if (successful) {
      resentStatusTitle = 'New code sent!'
      resendStatusBody =
        'An email confirmation code has been sent to ' +
        this.email +
        '. It will be valid for 30 minutes.'
    } else {
      resentStatusTitle = 'Bad request'
      resendStatusBody = 'There was an error processing your request.'
    }

    dialogStore.openDialog(
      VerificationCodeStatusDialog,
      {
        resentStatusTitle,
        resendStatusBody
      },
      closingData => {}
    )
  }
}

@Component({
  standalone: true,
  template: `
    <div class="space-y-5 p-8">
      <div class="space-y-2">
        <h2 class="text-2xl font-normal">
          {{ data.props.resentStatusTitle }}
        </h2>
        <p>{{ data.props.resendStatusBody }}</p>
      </div>
      <form method="dialog" class="flex justify-end">
        <button type="button" (click)="close('ok')" class="primary">OK</button>
      </form>
    </div>
  `
})
class VerificationCodeStatusDialog extends Dialog {}
