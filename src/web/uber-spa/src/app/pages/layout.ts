import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Header from '../components/common/header'
import NotificationOutlet from '@app/components/ui/notification/notificationOutlet'

@Component({
  standalone: true,
  imports: [Header, NotificationOutlet, RouterOutlet],
  template: `
    <Header></Header>
    <NotificationOutlet></NotificationOutlet>
    <div class="flex justify-center" style="min-height: calc(100vh - 64px);">
      <router-outlet></router-outlet>
    </div>
  `
})
export default class Layout {}
