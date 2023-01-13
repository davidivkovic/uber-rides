import { NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { userStore } from '@app/stores'
import { scheme, baseUrl } from '@app/api'
import { computed } from '@app/utils'

@Component({
  standalone: true,
  selector: 'Message',
  imports: [NgIf],
  template: `
    <div class="flex space-x-3 items-end" [class]="{'justify-end': isMine()}">
      <img *ngIf="!isMine()"
        [src]="message.sender.profilePicture"
        class="w-10 h-10 rounded-full bg-gray-50 object-cover"
      />
      <div
        class="max-w-xl py-3 px-5 rounded-2xl font-sans"
        [class]="setClass()"
      >
        {{ message.content }}
      </div>
    </div>
  `
})
export class Message {
  @Input() message: any
  scheme = scheme
  baseUrl = baseUrl

  setClass() {
    if(this.isMine()) {
      return 'bg-black text-white justify-end rounded-br-none'
    } 
    return 'bg-[#eeeeee] text-black rounded-bl-none'

  }

  isMine() {
    return this.message.sender.id === userStore.user.id
  }

}
