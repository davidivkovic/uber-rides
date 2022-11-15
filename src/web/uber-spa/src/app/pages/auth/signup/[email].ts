import { Component } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { NgForm, FormsModule } from '@angular/forms'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: ` <div class="h-full flex items-center justify-center">
    <div class="w-[320px]">
      <p class="mb-3 text-2xl ">
        Enter the 6-digit code sent to you at 062 8389925.
      </p>
      <form #verificationForm="ngForm" (ngSubmit)="verify(verificationForm)">
        <div class="flex justify-between w-full">
          <input
            *ngFor="let number of [0, 1, 2, 3, 4, 5]"
            ngModel
            #number="ngModel"
            [name]="'input' + number"
            (paste)="handlePaste($event)"
            (input)="handleInput($event)"
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
          *ngIf="verificationForm.submitted"
          class="text-red-600 text-sm -mt-5 "
        >
          Please enter the full code
        </label>
        <button class=" primary w-full mt-5">Verify account</button>
      </form>
    </div>
  </div>`
})
export class EmailVerification {
  handleInput = e => {
    const input = e.target as HTMLInputElement
    if (e.key === 'space' && input.previousElementSibling) {
      input.value = ''
      const previousSibling = input.previousElementSibling as HTMLElement
      previousSibling.focus()
    } else if (input.nextElementSibling && input.value) {
      const nextSibling = input.previousElementSibling as HTMLElement
      nextSibling.focus()
    }
  }
  handlePaste = (e: ClipboardEvent) => {
    const inputs = document
      .querySelector('form[name="verify-code"]')
      .querySelectorAll('input')
    const paste = e.clipboardData.getData('text')
    console.log(paste)
    inputs.forEach((input, i) => {
      input.value = paste[i] || ''
    })
  }

  verify = (f: NgForm) => {
    console.log(console.log(f.valid))
  }
}
