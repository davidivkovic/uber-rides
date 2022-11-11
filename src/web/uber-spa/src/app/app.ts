import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import DialogOutlet from './components/ui/dialog/dialogOutlet';
import HeaderComponent from './components/common/header';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <DialogOutlet></DialogOutlet>
  `,
})
export class AppComponent {
  title = 'uber-spa';
}
