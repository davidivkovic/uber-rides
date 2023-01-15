import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

import { scheme, baseUrl } from '@app/api'
import { NgIf } from '@angular/common'

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    past: "%s",
    s: '1s',
    ss: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1 month",
    MM: "%dm months",
    y: "1y",
    yy: "%dy"
  }
})

@Component({
  standalone: true,
  selector: 'PanelItem',
  imports: [RouterModule, NgIf],
  template: `
    <a [routerLink]="'/chat/' + conversation.id" class="w-full px-6 py-4 flex space-x-3 cursor-pointer relative">
      <img
        [src]="conversation.messages[0].sender.profilePicture"
        class="rounded-full h-12 w-12 object-cover"
      />
      <div class="flex-1">
        <span>
          {{ conversation.client.firstName + ' ' + conversation.client.lastName }}
        </span>
        <div class="text-gray-500 text-sm flex space-x-2 ">
        <div class="max-w-[160px] text-ellipsis whitespace-nowrap overflow-x-hidden">
          {{ conversation.messages[conversation.messages.length - 1].content }}
        </div>
        <span class="-mt-1">.</span>
        <div>
          {{ dayjs(conversation.messages[conversation.messages.length - 1].sentAt).fromNow() }}
        </div>
        </div>
      </div>
      <div *ngIf="!conversation.closed" class="absolute top-0 right-3 w-3 h-full flex items-center">
        <div class="bg-red-500 rounded-full w-2 h-2"></div>
      </div>
    </a>
  `
})
export class PanelItem {
  @Input() conversation: any
  dayjs = dayjs
  scheme = scheme
  baseUrl = baseUrl
}
