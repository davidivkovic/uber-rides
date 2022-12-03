import { Component, Input, ViewChild } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'

@Component({
  selector: 'CodeInputs',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <p class="mb-3 text-xl">Enter the 6-digit code sent to you at {{ email }}.</p>
    <div #inputContainer class="flex justify-between w-full">
      <input
        required
        [name]="'number'+number"
        *ngFor="let number of [0, 1, 2, 3, 4, 5]; trackBy: ngForIdentity"
        (paste)="handlePaste($event)"
        (keydown)="handleInput($event, number)"
        class="w-12 h-12 px-0 text-center text-base"
        type="text"
        oninput="this.value =
              this.value.replace(/[^0-9.]/g, '').replace(/(..*?)..*/g,'$1');
            "
      />
    </div>
  `
})
export class CodeInputs {
  @Input() email: string

  @ViewChild('inputContainer') inputContainer

  array = ['', '', '', '', '', '']

  focusSibling = (sibling: HTMLElement) => {
    setTimeout(() => sibling.focus(), 0)
  }

  handleInput = (e: KeyboardEvent, number: number) => {
    const input = e.target as HTMLInputElement
    const keyCode = e.key
    const previousSibling = input.previousElementSibling as HTMLElement
    const nextSibling = input.nextElementSibling as HTMLElement

    if (keyCode === 'ArrowLeft' && previousSibling) {
      this.focusSibling(previousSibling)
    } else if (['ArrowRight', 'Tab'].includes(keyCode) && input.nextElementSibling) {
      this.focusSibling(nextSibling)
    } else if (keyCode === 'Backspace') {
      input.value = ''
      if (previousSibling) {
        this.focusSibling(previousSibling)
      }
    } else if (Number(keyCode) || keyCode === '0') {
      input.value = Number(keyCode).toString()
      if (nextSibling) {
        this.focusSibling(nextSibling)
      }
    }
  }

  handlePaste = (e: ClipboardEvent) => {
    const paste = e.clipboardData.getData('text')
    const inputs = this.inputContainer.nativeElement.childNodes
    inputs.forEach((input, index) => input.value = paste[index])
  }

  ngForIdentity = (index: number, item: any) => item.index
}
