import { Component } from '@angular/core'
import { NgComponentOutlet, NgForOf } from '@angular/common'
import { NavigationEnd, Router } from '@angular/router'
import { notificationStore } from '@app/stores'
import { Notification } from './'

@Component({
  standalone: true,
  selector: 'NotificationOutlet',
  imports: [NgForOf, NgComponentOutlet, Notification],
  template: `
    <div id="notification-outlet" class="grid">
      <Notification 
        *ngFor="let notification of notificationStore.notifications"
        (closed)="notification.close()"
        style="grid-area: 1 / 1 / 2 / 2"
      >
        {{ notification.message }}
      </Notification>
    </div>
  `
})
export default class NotificationOutlet {
  notificationStore = notificationStore

  constructor(public router: Router) {
    router.events.subscribe(e => e instanceof NavigationEnd && notificationStore.closeAll())
  }
}