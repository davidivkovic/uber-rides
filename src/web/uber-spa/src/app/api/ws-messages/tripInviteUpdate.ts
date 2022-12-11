import { dialogStore, notificationStore, userStore } from '@app/stores'
import { ridesStore } from '@app/stores/ridesStore'
import { TripInviteDialog } from './tripInvite'

export default (message: { passengerId: number, status: string, carPricesInUsd: any }) => {
  ridesStore.setState(async store => {
    if (message.status === 'REMOVED') {
      store.state.passengers = store.state.passengers?.filter((p: any) => p.id !== message.passengerId) ?? []
      if (!store.state.passengers.length) store.state.rideChosen = false
    }
    else {
      const passenger = store.state.passengers?.find((p: any) => p.id === message.passengerId)
      if (!passenger) return
      passenger.accepted = message.status === 'ACCEPTED'
      passenger.declined = message.status === 'DECLINED'
    }

    if (message.status === 'REMOVED' && message.passengerId === userStore.user?.id) {
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