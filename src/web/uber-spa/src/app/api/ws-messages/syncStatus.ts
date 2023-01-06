import { userStore } from '@app/stores'

export default (message: { trip: {}, isOnline: boolean }) => {
  userStore.setIsOnline(message.isOnline)
  window.detector.detectChanges()
}