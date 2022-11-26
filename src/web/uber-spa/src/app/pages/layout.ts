import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Header from '../components/common/header'
import NotificationOutlet from '@app/components/ui/notification/notificationOutlet'

@Component({
  standalone: true,
  imports: [Header, NotificationOutlet, RouterOutlet],
  template: `
    <div class="h-screen flex flex-col">
      <Header></Header>
      <NotificationOutlet></NotificationOutlet>
      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export default class Layout { }
