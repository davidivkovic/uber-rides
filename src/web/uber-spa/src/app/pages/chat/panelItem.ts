import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

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
  imports: [RouterModule],
  template: `<div [routerLink]="'/chat/' + conversation.id" class="w-full px-6 py-5 flex space-x-3 cursor-pointer">
    <img
      [src]="conversation.client.profilePicture"
      class="rounded-full h-12 w-12 object-cover"
    />
    <div class="flex-1">
      <div>
        {{ conversation.client.firstName + ' ' + conversation.client.lastName }}
      </div>
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
  </div>`
})
export class PanelItem {
  @Input() conversation: any
  dayjs = dayjs
}
