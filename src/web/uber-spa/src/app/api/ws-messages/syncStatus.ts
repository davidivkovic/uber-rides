import { ridesStore, userStore } from '@app/stores'
import { removeAllElements } from '../google-maps'

export default (message: { trip: any, isOnline: boolean }) => {
  userStore.setIsOnline(message.isOnline)
  if (
    userStore.isAdmin
    || location.pathname.startsWith('/profile')
    || location.pathname.startsWith('/live-support')
    || location.pathname.startsWith('/chat')
  ) return
  if (!message?.trip?.ownerId) {
    removeAllElements()
    ridesStore.setState(store => {
      store.data = {}
      store.setMapElements()
    })
  }
  else if (!ridesStore.data.trip) {
    ridesStore.setState(store => {
      store.data.trip = message.trip
      store.data.pickup.trip = message.trip
      store.data.tripInProgress = true
    })
  }
  setTimeout(() => {
    window.router.navigate(['/']).then(() => window.detector.detectChanges())
  }, 500)
}