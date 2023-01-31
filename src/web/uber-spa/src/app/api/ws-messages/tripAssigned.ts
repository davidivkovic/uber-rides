import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

import { createInfoWindow, createMarker, createPolyline, removeAllElements } from '@app/api/google-maps'
import { dialogStore, notificationStore, userStore } from '@app/stores'
import { ridesStore } from '@app/stores/ridesStore'
import { TripInviteDialog } from './tripInvite'

dayjs.extend(utc)
dayjs.extend(tz)

const tripAssignedAudio = new Audio('/assets/sounds/trip_assigned.m4r')
const tripNotificationAudio = new Audio('/assets/sounds/payment_success.mp4')

export default async (message: { trip: any, directions: any, driverDuration: number, driverDistance: number } | any) => {
  if (message.trip.scheduled) {
    userStore.isDriver && tripNotificationAudio.play()
    if (message.trip.status === 'PAID') {
      removeAllElements()
      ridesStore.setMapElements()
      ridesStore.pages?.lookingPage?.cleanUp?.()
      ridesStore.pages?.chooseRidesPage?.cleanUp?.()
      const scheduledAt = dayjs.utc(message.trip.scheduledAt).tz('Europe/Belgrade')
      if (userStore.isDriver) {
        await window.router.navigate(['/'])
        notificationStore.show(
          'You have been assigned a scheduled ride for '
          + (dayjs().isSame(scheduledAt, 'day') ? 'today' : 'tomorrow')
          + ' at '
          + scheduledAt.format('HH:mm')
          + '.'
        )
      }
      else {
        ridesStore.setState(store => store.data = {})
        await window.router.navigate(['/'])
        dialogStore.openDialog(
          TripInviteDialog,
          {
            noCloseButton: true,
            trip: message.trip,
            inviter: message.trip.riders.find((rider: any) => rider.id === message.trip.ownerId),
            scheduleSuccess: true
          },
          async status => { }
        )
        window.detector.detectChanges()
        // notificationStore.show('ok at ' + scheduledAt.format('HH:mm'))// TODO: Replace with a dialog for rider
      }
      return
    }
    if (message.trip.status === 'SCHEDULED' && userStore.isRider) {
      notificationStore.show('The driver is finishing his current ride and will be picking you up shortly.')
      return
    }
    else if (message.trip.status === 'AWAITING_PICKUP' && userStore.isRider) {
      notificationStore.show('The driver is now on his way to pick you up.')
    } // All good, the driver is on his way
  }

  const points = google.maps.geometry.encoding.decodePath(message.directions.routes[0].overviewPolyline.encodedPath)
  const desintaion = points[points.length - 1]
  const pickupMarker = userStore.user.role === 'ROLE_DRIVER'
    ? createMarker(desintaion.lat(), desintaion.lng(), true, 'pickup')
    : null
  const pickupPolyline = createPolyline(points, '#000', 'pickup')

  message.distance = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.distance.inMeters, 0)
  message.duration = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.duration.inSeconds, 0)
  message.trip.riders.forEach((passenger: any) => passenger.accepted = true)

  ridesStore.setState(store => {
    store.data.trip = message.trip
    store.data.pickup = message
    store.mapElements.pickupPolyline = pickupPolyline
    if (pickupMarker !== null) store.mapElements.pickupMarkers = [pickupMarker]
  })

  if (userStore.isDriver) {
    tripAssignedAudio.play()
    await window.router.navigate(['/pickup'])
  }
  else if (userStore.isRider) {
    // if (message.trip.scheduled) tripAssignedAudio.play()
    window.router.navigate(['/passengers'])
  }
  window.detector.detectChanges()
}