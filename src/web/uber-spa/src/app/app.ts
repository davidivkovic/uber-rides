import { ChangeDetectorRef, Component } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import DialogOutlet from './components/ui/dialog/dialogOutlet'
import '@app/stores/userStore'

export { }

declare global {
  interface Window {
    router: Router,
    detector: ChangeDetectorRef
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
    window.router = router
    window.detector = detector
  }

}
