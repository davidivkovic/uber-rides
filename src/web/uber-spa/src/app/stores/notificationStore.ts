import { action, state, createStore } from 'usm-mobx'
import { Notification } from '@app/components/ui/notification'

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
  }

  @action
  close(id: string) {
    this.notifications = this.notifications.filter(d => d.id != id)
  }
}

const notificationStore = new NotificationStore()

createStore({
  modules: [notificationStore]
})

export { notificationStore }