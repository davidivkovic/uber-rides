import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Conversation } from './conversation'
import { Panel } from './panel'
import { userStore } from '@app/stores'

@Component({
  standalone: true,
  imports: [Panel, NgIf, Conversation, RouterModule],
  template: `
    <div class="h-full w-full flex items-center justify-center bg-gray-200">
      <div class="w-[1100px] mx-auto bg-white rounded-lg h-[800px] min-h-0 my-auto flex">
        <Panel *ngIf="userStore.isAdmin"></Panel>
        <div class="flex-1 rounded-lg">
          <div
            *ngIf="conversationId === null && userStore.isAdmin; else other_content"
            class="flex flex-col h-full w-full space-y-2 justify-center items-center"
          >
            <svg
              aria-label="Direct"
              class="_ab6-"
              color="#262626"
              fill="#262626"
              height="96"
              role="img"
              viewBox="0 0 96 96"
              width="96"
            >
              <circle
                cx="48"
                cy="48"
                fill="none"
                r="47"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              ></circle>
              <line
                fill="none"
                stroke="currentColor"
                stroke-linejoin="round"
                stroke-width="2"
                x1="69.286"
                x2="41.447"
                y1="33.21"
                y2="48.804"
              ></line>
              <polygon
                fill="none"
                points="47.254 73.123 71.376 31.998 24.546 32.002 41.448 48.805 47.254 73.123"
                stroke="currentColor"
                stroke-linejoin="round"
                stroke-width="2"
              ></polygon>
            </svg>
            <div class="text-lg">Your messages</div>
            <div class="text-gray-500 text-sm">View customers messages and try to help them</div>
          </div>
          <ng-template #other_content>
            <Conversation></Conversation>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export default class Chat {
  conversationId = ''

  userStore = userStore

  constructor(public router: Router, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.conversationId = params.get('id')
    })
  }
}
