import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { Component } from '@angular/core'
import { CurrencyPipe, NgIf } from '@angular/common'
import { Dialog } from '@app/components/ui/dialog'
import { computed, formatDistance, formatDuration } from '@app/utils'
import { dialogStore, ridesStore } from '@app/stores'
import { OutboundMessages } from './messages'
import { send } from '../ws'
import { createInfoWindow, createMarker, createPolyline, removeAllElements } from '../google-maps'

dayjs.extend(utc)
dayjs.extend(tz)

export default (message: { inviter: any, trip: any }) => {
  dialogStore.openDialog(
    TripInviteDialog,
    {
      noCloseButton: true,
      trip: message.trip,
      inviter: message.inviter
    },
    status => {
      const accepted = status === 'accept'
      send(OutboundMessages.ANSWER_TRIP_INVITE, { inviterId: message.inviter.id, accepted })
      if (accepted) {
        message.trip.riders.forEach((passenger: any) => passenger.accepted = true)
        const stops = [message.trip.route.start, ...message.trip.route.stops]
        removeAllElements()
        // createPolyline(message.trip.route.encodedPolyline, '#000')
        stops.map((stop, index) => {
          return createMarker(stop.latitude, stop.longitude, index === stops.length - 1)
        })
        stops.map((stop, index) => {
          return createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
        })
        message.trip.riders = message.trip.riders.map((r: any) => ({ accepted: true, declined: false, ...r }))
        ridesStore.setState(store => {
          store.data.inviter = message.inviter
          store.data.trip = message.trip
        })
        window.router.navigate(['passengers'])
      }
    }
  )
  window.detector.detectChanges()
}

@Component({
  standalone: true,
  selector: 'TripInviteDialog',
  imports: [NgIf, CurrencyPipe],
  template: `
    <div class="bg-white w-[360px] pointer-events-auto space-y-2 max-w-md">
      <div class="flex items-center space-x-3 mb-4">
        <img [src]="props.inviter.profilePicture" class="w-10 h-10 mt-1.5 rounded-full object-cover"/>
        <div>
          <h3 class="tracking-wide text-lg">{{ props.inviter.firstName }} {{ props.inviter.lastName }}</h3>
          <p class="leading-3 text-[15px] text-zinc-900">Invited you on a ride</p>
        </div>
        <h3 class="flex-1 text-right text-lg text-zinc-700 tracking-wide">{{ formattedTime() }}</h3>
      </div>
      <div class="overflow-clip relative rounded-md text-white">
        <div class="absolute w-full bottom-0 opacity-90 bg-gradient-to-t from-black to-transparent h-1/2"></div>
        <div class="absolute inset-x-3 bottom-3">
          <div class="absolute left-0 bottom-0 bg-black bg-opacity-30 blur-lg w-full h-full"></div>
          <div class="flex w-full justify-between items-end">
            <div class="relative">
              <p class="text-[15px]">
                {{ formatAddress(props.trip.route.start.address) }}
              </p>
              <p class="text-[15px]">
                {{ formatAddress(props.trip.route.stops[props.trip.route.stops.length - 1].address) }}
              </p>
            </div>
            <div class="text-right z-10">
              <h3 class="text-xl leading-5 mt-0.5">{{ formatDistance(props.trip.distanceInMeters) }}</h3>
              <p class="text-sm">approx. {{ formatDuration(props.trip.durationInSeconds) }}</p>
            </div>
          </div>
        </div>
        <img [src]="props.trip.route.thumbnail" class="object-cover rounded-md"/>
      </div>
      <div class="flex items-center -ml-2 -mt-1 pr-3.5">
        <img [src]="props.trip.car.type.image" class="w-[100px] h-[100px]" />
        <div class="w-[120px] ml-1.5 mr-6">
          <div class="flex space-x-2 font-medium">
            <h3 class="text-xl w-min">{{ props.trip.car.type.name }}</h3>
            <div class="flex items-center font-medium">
              <svg class="mb-0.5 mr-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <title>Person</title>
                <path 
                  fill-rule="evenodd" 
                  clip-rule="evenodd" 
                  d="M17.5 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zM3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6v3H3v-3z" 
                  fill="currentColor"
                  >
                </path>
              </svg>
              {{ props.trip.car.type.seats }}
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ props.trip.car.type.description }}</p>
        </div>
        <div class="ml-auto text-right">
          <h3 class="text-[22px]">
            {{ props.trip.totalPrice / (props.trip.riders.length + 1) | currency:'USD' }}
          </h3>
          <p class="text-[13px] ml-0.5 -mt-1 mb-0.5 text-zinc-500">
            Per person
          </p>
          <p class="text-[13px] ml-0.5 -mt-1 text-zinc-500">Including tax</p>
        </div>
      </div>
      <form method="dialog" class="">
        <button type="button" (click)="close('accept')" class="primary block w-full mt-4">Accept</button>
        <button type="button" (click)="close('decline')" class="secondary block w-full py-2.5 mt-1">Decline</button>
      </form>
    </div>
  `
})
export class TripInviteDialog extends Dialog {

  formatDistance(distance: number) {
    return formatDistance(distance)
  }

  formatDuration(duration: number) {
    return formatDuration(duration)
  }

  formatAddress(address: string) {
    return address.split(',').splice(0, 2).join(', ')
  }

  formattedTime = computed(
    () => this.props.trip.scheduled,
    () => {
      if (this.props.trip?.scheduledAt) {
        return dayjs.utc(this.props.trip.scheduledAt).tz('Europe/Belgrade').format('HH:mm')
      }
      return dayjs().format('HH:mm')
    }
  )
}