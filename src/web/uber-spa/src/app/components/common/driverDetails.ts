import { Component, Input } from '@angular/core'

@Component({
  selector: 'DriverDetails',
  standalone: true,
  template: `
    <div>
      <p>{{ driver.firstName }} {{ driver.lastName }}</p>
      <p>{{ driver.rating }}</p>
    </div>
  `
})
export default class DriverDetails {
  @Input() driver: any
}