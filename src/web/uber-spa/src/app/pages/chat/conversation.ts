import { Component, Input } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Message } from './message'
import { chatStore, userStore } from '@app/stores'
import dayjs from 'dayjs'
import { baseUrl, scheme } from '@app/api'
import { computed, PFP } from '@app/utils'

@Component({
  standalone: true,
  selector: 'Conversation',
  imports: [NgFor, NgIf, Message, RouterModule, FormsModule, PFP],
  template: `
    <div
      *ngIf="chatStore.currentConversation != null"
      class="h-full w-full flex flex-col max-h-full"
    >
      <div class="border-b-[1px] px-10 h-24 justify-center flex flex-col">
        <div class="text-xl flex items-center justify-between">
          <div class="flex space-x-5 items-center">
            <img
              [src]="imageUrl() | PFP" 
              class="h-8 w-8 rounded-full object-cover"
            />
            <h3>{{ name() }}</h3>
          </div>
          <svg
            *ngIf="userStore.isAdmin && !chatStore.currentConversation.closed"
            (click)="endConversation()"
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-message-2-off text-red-600 cursor-pointer"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path
              d="M9 5h8a3 3 0 0 1 3 3v6a2.97 2.97 0 0 1 -.44 1.563m-2.56 1.437h-2l-3 3l-3 -3h-2a3 3 0 0 1 -3 -3v-6c0 -1.092 .584 -2.049 1.457 -2.573"
            ></path>
            <path d="M8 9h1m4 0h3"></path>
            <path d="M8 13h5"></path>
            <path d="M3 3l18 18"></path>
          </svg>
        </div>
        <div class="ml-[52px] text-sm text-gray-500">
          Conversation started at
          {{ dayjs(chatStore.currentConversation.messages[0].sentAt).format('MMM D, YYYY h:mm A') }}
        </div>
      </div>
      <div class="flex-1 overflow-hidden flex flex-col-reverse">
        <div class="space-y-3.5 space-y-reverse overflow-y-auto flex flex-col-reverse p-10">
          <div
            *ngIf="chatStore.currentConversation.closed"
            class="h-32 flex flex-col items-center justify-center"
          >
            <div class="text-gray-500">{{ dayjs(chatStore.currentConversation.closedAt).format('MMM D, YYYY h:mm A') }}</div>
            <div class="text-lg">
              Chat ended by
              {{
                chatStore.currentConversation.admin.firstName +
                  ' ' +
                  chatStore.currentConversation.admin.lastName
              }}.
            </div>
          </div>
          <div *ngFor="let message of chatStore.messages">
            <Message [message]="message"></Message>
          </div>
        </div>
      </div>
      <form
        *ngIf="!chatStore.currentConversation.closed"
        ngNativeValidate
        (submit)="sendMessage($event)"
        class="relative h-20 w-full p-5 py-0 items-center flex justify-center"
      >
        <input
          [(ngModel)]="message"
          type="text"
          class="w-full h-12 px-5 font-sans"
          placeholder="Type your message here.."
          name="message"
          id="message"
          autocomplete="off"
        />
        <button class="absolute right-5 font-sans">Send</button>
      </form>
    </div>
  `
})
export class Conversation {
  message = ''

  chatStore = chatStore
  userStore = userStore
  dayjs = dayjs

  baseUrl = baseUrl
  scheme = scheme

  async sendMessage(event: Event) {
    if (!this.message) return
    event.preventDefault()
    chatStore.sendMessage(this.message)
    this.message = ''
  }

  async endConversation() {
    chatStore.sendMessage('End', true)
  }

  name = computed(
    [() => userStore.isAdmin, () => chatStore.currentConversation],
    () => {
      if (!chatStore.currentConversation) return ''
      const name = userStore.isAdmin
        ? chatStore.currentConversation.client.firstName + ' ' + chatStore.currentConversation.client.lastName
        : chatStore.currentConversation.admin.firstName + ' ' + chatStore.currentConversation.admin.lastName
      return name
    }
  )

  imageUrl = computed(
    [() => userStore.isAdmin, () => chatStore.currentConversation],
    () => {
      if (!chatStore.currentConversation) return ''
      const profilePic: string = userStore.isAdmin
        ? chatStore.currentConversation.client.profilePicture
        : chatStore.currentConversation.admin.profilePicture
      if (profilePic?.startsWith('http')) return profilePic
      return scheme + baseUrl + '/users/pictures/' + profilePic
    }
  )
}
