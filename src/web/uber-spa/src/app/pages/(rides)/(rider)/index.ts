import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf, Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { init } from '@app/api/google-maps'
import AddPassengers from './components/addPassengers'
import Looking from './components/looking'
import ChooseRide from './components/chooseRide'

type AutocompleteLocation = {
  id: string
  primary: string
  secondary: string
  icon: string,
  selected: boolean
}

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, Looking, AddPassengers, ChooseRide],
  template: `
    <div class="h-full relative">
      <div id="gooogle-map" class="absolute w-full h-full"></div>
      <div class="h-full w-full absolute z-10 pointer-events-none">
        <div class="max-w-7xl mx-auto w-full h-full flex items-center px-4">
          <Looking
            [hidden]="path !== 'looking'"
          >
          </Looking>
          <AddPassengers
            [hidden]="path !== 'add-passengers'"
            (confirm)="router.navigate(['choose-ride'])"
            (cancel)="location.back()"
          >
          </AddPassengers>
          <ChooseRide 
            [hidden]="path !== 'choose-ride'"
            (cancel)="location.back()"
          >
          </ChooseRide>
        </div>
      </div>
    </div>
  `
})
export default class Index {

  path = 'looking'

  constructor(public router: Router, public route: ActivatedRoute, public location: Location) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.path = params.get('path')
    })
  }

  ngAfterViewInit() {
    init('gooogle-map')
  }
}