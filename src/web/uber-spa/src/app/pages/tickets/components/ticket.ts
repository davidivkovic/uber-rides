import { Component, Input } from '@angular/core'
import { watchEffect, computed } from 'src/app/utils'

@Component({
  selector: 'Ticket',
  standalone: true,
  template: `
    {{ watchId() }}
    <div>This is the ticket.ts component passed prop id: {{ id }}</div>
    <div>{{ prettyTicketId() }}</div>
    <div>Ticket Counter: {{ counter }}</div>
    <button (click)="increment()">Increment ticket counter</button>
  `
})

export default class Ticket {
  @Input() id = ''
  counter = 0

  increment = () => this.counter++

  watchId = watchEffect(() => this.id, () => console.log(this.id))
  prettyTicketId = computed(() => this.id, () => `Pretty ticket ID: 000${this.id}`)
}