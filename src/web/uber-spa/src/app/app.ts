import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import DialogOutlet from "./components/ui/dialog/dialogOutlet"

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
}