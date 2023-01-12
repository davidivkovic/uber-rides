import { ChangeDetectorRef, Component } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import DialogOutlet from './components/ui/dialog/dialogOutlet'
import '@app/stores/userStore'
import { init } from './api/google-maps'

export { }

declare global {
  interface Window {
    router: Router,
    detector: ChangeDetectorRef,
    shellHeight: () => number
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogOutlet],
  template: `
    <router-outlet></router-outlet>
    <DialogOutlet></DialogOutlet>
  `
})
export class AppComponent {

  title = 'uber-spa'

  constructor(router: Router, detector: ChangeDetectorRef) {
    init()
    window.router = router
    window.detector = detector
    window.shellHeight = () =>
      window.innerHeight
      - (document.getElementById('footer')?.clientHeight ?? 0)
      - (document.getElementById('header')?.clientHeight ?? 0)
      - (document.getElementById('notification-outlet')?.clientHeight ?? 0)
  }

}
