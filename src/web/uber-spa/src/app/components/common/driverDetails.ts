import { NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'DriverDetails',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="driver">
      <p>{{ driver.firstName }} {{ driver.lastName }}</p>
      <p>{{ driver.rating }}</p>
    </div>
  `
})
export default class DriverDetails {
  @Input() driver: any
}