import { action, state, createStore } from 'usm-mobx'

class NotificationData {
  id: string
  message: string
  close: () => void
}

class NotificationStore {

  @state
  notifications: NotificationData[] = []

  @action
  show(message: string) {
    if (message == this.notifications.slice(-1)[0]?.message) return
    const id = `notification-${this.notifications.length}`
    this.notifications.push({
      id,
      message,
      close: () => this.close(id)
    })
    window.detector.detectChanges()
  }

  @action
  close(id: string) {
    this.notifications = this.notifications.filter(d => d.id != id)
    window.detector.detectChanges()
  }

  @action
  closeAll() {
    this.notifications.length = 0
  }
}

const notificationStore = new NotificationStore()

createStore({
  modules: [notificationStore]
})

export { notificationStore }