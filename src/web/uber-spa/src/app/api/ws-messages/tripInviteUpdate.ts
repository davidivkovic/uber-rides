import { dialogStore, notificationStore, userStore } from '@app/stores'
import { ridesStore } from '@app/stores/ridesStore'
import { baseUrl, scheme } from '..'
import { TripInviteDialog } from './tripInvite'

export default (message: { passenger: any, status: string, carPricesInUsd: any }) => {
  ridesStore.setState(async store => {
    if (message.status === 'REMOVED') {
      store.state.passengers = store.state.passengers?.filter((p: any) => p.id !== message.passenger.id) ?? []
      if (store.state.trip) {
        store.state.trip.riders = store.state.trip.riders.filter((p: any) => p.id !== message.passenger.id)
      }
      if (!store.state.passengers.length) {
        store.state.rideChosen = false
      }
    }
    else {
      let passenger = store.state.passengers?.find((p: any) => p.id === message.passenger.id)
      if (!passenger) {
        if (store.state.trip && message.status === 'ACCEPTED' && message.passenger.id !== userStore.user?.id) {
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
      passenger?.isNew && store.state.trip.riders.push(passenger)
    }

    if (message.status === 'REMOVED' && message.passenger.id === userStore.user?.id) {
      dialogStore.closeOneByType(TripInviteDialog)
      await window.router.navigate(['/looking'])
      notificationStore.show('The owner has removed you from the ride.')
    }
    else {
      if (!store.state?.directions) store.state.directions = {}
      store.state.directions.carPricesInUsd = message.carPricesInUsd
      store.state?.chooseRidesPage?.checkPassengersReady?.()
    }
  })
  window.detector.detectChanges()
}