import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { Dialog } from '@app/components/ui/dialog'
import { dialogStore } from '@app/stores'
import { createMessage, OutboundMessages } from './messages'
import { send } from '../ws'

export default (message: { inviter: any, trip: any }) => {
  dialogStore.openDialog(
    ContinueDialog,
    {
      title: message.inviter.firstName + ' Invited you on a trip',
      body: 'From ' + message.trip.route.start.address + 'to ' + message.trip.route.stops[message.trip.route.stops.length - 1].address
    },
    status => {
      send(
        createMessage(
          OutboundMessages.ANSWER_TRIP_INVITE,
          { inviterId: message.inviter.id, accepted: status === 'accept' }
        )
      )
    }
  )
}

@Component({
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="space-y-5 p-5 max-w-md">
      <div class="space-y-2">
        <h2 class="text-2xl font-normal">
          {{ props.title }}
        </h2>
        <p class="text-gray-800">{{ props.body }}</p>
      </div>
      <form method="dialog" class="flex justify-end">
        <button type="button" (click)="close('decline')" class="secondary mt-3">Decline</button>
        <button type="button" (click)="close('accept')" class="primary mt-1">Accept</button>
      </form>
    </div>
  `
})
class ContinueDialog extends Dialog { }