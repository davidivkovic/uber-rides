import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, RouterModule } from "@angular/router"
import Ticket from "./components/ticket"

@Component({
  standalone: true,
  imports: [Ticket, RouterModule],
  template: `
    <div>Hello from tickets/[:id].ts at {{ time }}</div>
    <a [routerLink]="'/tickets/' + 1">First ticket</a> 
    <br>
    <a routerLink="/tickets/2">Second ticket</a>
    <Ticket [id]="ticketId"></Ticket>
  `
})

export class Id implements OnInit {
  ticketId = ''
  time = new Date()

  constructor(public route: ActivatedRoute) {
    // console.log(route.params)
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.ticketId = params.get('id')
      console.log(params.get('id'))
    })
  }
}