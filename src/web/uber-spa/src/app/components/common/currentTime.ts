import { DatePipe } from '@angular/common'
import { Component } from '@angular/core'

@Component({
  selector: 'CurrentTime',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h3>{{ now | date: 'HH:mm' }}</h3>
  `
})
export default class CurrentTime {
  now: number
  constructor() {
    setInterval(() => this.now = Date.now(), 1)
  }
}