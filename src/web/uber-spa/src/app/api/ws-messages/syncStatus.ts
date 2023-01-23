import { ridesStore, userStore } from '@app/stores'
import { removeAllElements } from '../google-maps'

export default (message: { trip: any, isOnline: boolean }) => {
  userStore.setIsOnline(message.isOnline)
  if (!message?.trip?.id) {
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
  // setTimeout(() => {
  //   window.router.navigate(['/'])
  //   window.detector.detectChanges()
  // }, 500)
}