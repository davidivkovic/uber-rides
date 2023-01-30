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
  else {
    ridesStore.setState(store => {
      store.data.trip = message.trip
    })
  }
  setTimeout(() => {
    window.router.navigate(['/']).then(() => window.detector.detectChanges())
  }, 500)
}