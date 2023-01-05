import { dialogStore, notificationStore, userStore } from '@app/stores'
import { ridesStore } from '@app/stores/ridesStore'
import { baseUrl, scheme } from '..'
import { TripInviteDialog } from './tripInvite'

export default (message: { passenger: any, status: string, carPricesInUsd: any }) => {
  ridesStore.setState(async store => {
    if (message.status === 'REMOVED') {
      store.data.passengers = store.data.passengers?.filter((p: any) => p.id !== message.passenger.id) ?? []
      if (store.data.trip) {
        store.data.trip.riders = store.data.trip.riders.filter((p: any) => p.id !== message.passenger.id)
      }
      if (!store.data.passengers.length) {
        store.data.rideChosen = false
      }
    }
    else {
      let passenger = store.data.passengers?.find((p: any) => p.id === message.passenger.id)
      if (!passenger) {
        if (store.data.trip && message.status === 'ACCEPTED' && message.passenger.id !== userStore.user?.id) {
          passenger = {
            ...message.passenger,
            accepted: false,
            declined: false,
            profilePicture: scheme + baseUrl + message.passenger.profilePicture,
            isNew: true
          }
        }
        else return
      }
      passenger.accepted = message.status === 'ACCEPTED'
      passenger.declined = message.status === 'DECLINED'
      passenger?.isNew && store.data.trip.riders.push(passenger)
    }

    if (message.status === 'REMOVED' && message.passenger.id === userStore.user?.id) {
      dialogStore.closeOneByType(TripInviteDialog)
      await window.router.navigate(['/looking'])
      notificationStore.show('The owner has removed you from the ride.')
    }
    else {
      if (!store.data?.directions) store.data.directions = {}
      store.data.directions.carPricesInUsd = message.carPricesInUsd
      store.pages?.chooseRidesPage?.checkPassengersReady?.()
    }
  })
  window.detector.detectChanges()
}