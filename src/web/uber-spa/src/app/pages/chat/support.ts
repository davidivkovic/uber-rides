import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { chatStore } from '@app/stores'

@Component({
  standalone: true,
  imports: [NgIf, RouterModule, FormsModule],
  template: `
    <div class="h-full flex items-center">
      <div class="h-fit w-[550px] mx-auto">
        <h1 class="text-5xl">Welcome to Uber Live Support</h1>
        <p class="text-gray-700 mt-3">
          Experiencing a problem while on uber.com? Tell us about your problem or ask a question.
          Our active admins will help you out.
        </p>
        <form (submit)="initConversation($event)" class="flex w-full space-x-3 mt-10 items-center">
        <input ngNativeValidate required [(ngModel)]="message" name="message" type="text" class="h-14" placeholder="How can we help?">
        <button class="primary h-14 rounded-lg">Send</button>
        </form>
        <div *ngIf="chatStore.failedConnection" class="mt-5">Sorry, there are currently no admins online. Try again later.</div>
      </div>
    </div>
  `
})
export default class LiveSupport {
  message = ''

  chatStore = chatStore

  constructor(public router: Router) {}

  async ngOnInit() {
    await chatStore.setCurrentConversation()
    if (chatStore.currentConversation !== null) {
      this.router.navigate(['/chat'])
    }
  }

  initConversation(event: Event) {
    if(!this.message) return
    event.preventDefault()
    chatStore.sendMessage(this.message)
    this.router.navigate(['/chat'])
  }
}
