import { Component, ViewChild } from '@angular/core'
import cars from '@app/api/cars'
import { NgIf, NgFor, NgClass } from '@angular/common'
import carTypeJson from '@app/../assets/files/car-models.json'
import { computed } from '@app/utils'
import { ActivatedRoute, Router } from '@angular/router'
import { dialogStore } from '@app/stores'
import { ContinueDialog } from '../components/continueDialog'

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  template: ` <form
    ngNativeValidate
    (submit)="registerCar($event)"
    class="flex-1 h-full flex flex-col space-y-10 justify-center items-center mx-auto w-[600px]"
  >
    <div class="space-y-5 w-full">
      <div>
        <div class="text-2xl">Give us some info about the driver's car</div>
        <p class="text-gray-500">
          In order to complete the driver's registration, you must register his car.
        </p>
      </div>
      <div class="flex justify-between w-full gap-8">
        <select required #maker (change)="changeSelectedMaker(maker.value)" name="make">
          <option value="" selected disabled hidden>Select car maker</option>
          <option *ngFor="let maker of types" [value]="maker">
            {{ maker }}
          </option>
        </select>
        <select required #model name="model" class="">
          <option value="" selected disabled hidden>Select car model</option>
          <option *ngFor="let model of models()" [value]="model">
            {{ model }}
          </option>
        </select>
      </div>
      <div class="flex justify-between w-full gap-8">
        <input
          required
          type="number"
          min="2012"
          max="2023"
          name="year"
          placeholder="Enter car's manufacturing year"
        />
        <input type="text" placeholder="Enter car's registration" name="registration" />
      </div>
    </div>
    <div class="space-y-5">
      <div class="w-full">
        <div class="text-2xl">Choose a uber car type</div>
        <p class="text-gray-500">
          Driver's earnings depend on the type of car he drives.
        </p>
      </div>
      <div *ngIf="carTypes.length !== 0" class="flex space-x-4">
        <div
          *ngFor="let carType of carTypes"
          (click)="selectCarType(carType)"
          [ngClass]="{
            'ring-2 ring-black ring-offset-[3px] bg-zinc-50 transition-none': carType.name === selectedCarType?.name
          }"
          class="rounded-md bg-[#eeeeee] p-5 w-full hover:bg-zinc-50 cursor-pointer transition-all duration-150"
        >
          <img [src]="carType.image" class="mx-auto" />
          <div class="flex justify-between">
            <h3 class="font-bold text-lg">{{ carType.name }}</h3>
            <div class="flex space-x-2 font-medium">
              <div class="flex items-center font-medium">
                <svg class="mb-0.5 mr-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <title>Person</title>
                  <path 
                    fill-rule="evenodd" 
                    clip-rule="evenodd" 
                    d="M17.5 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zM3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6v3H3v-3z" 
                    fill="currentColor"
                    >
                  </path>
                </svg>
                {{ carType.seats }}
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ carType.description }}</p>
        </div>
      </div>
    </div>
    <div class="w-full">
      <p class="text-red-600 text-center text-sm">{{ error }}</p>
      <button class="primary w-full">Complete registration</button>
    </div>
  </form>`
})
export default class Index {
  @ViewChild('model') modelSelect

  carTypes: Array<CarType> = []

  selectedCarType: CarType
  selectedMaker: string

  types = []
  error = ''
  driverId = ''

  constructor(public router: Router, public route: ActivatedRoute) { }


  async ngOnInit(): Promise<void> {
    this.carTypes = await cars.getAllCarTypes()
    this.types = carTypeJson.map(type => type.brand)
    this.route.paramMap.subscribe(params => {
      this.driverId = params.get('driverId')
    })
  }

  selectCarType = (carType: CarType) => {
    this.selectedCarType = carType
  }

  models = computed(
    () => this.selectedMaker,
    () => carTypeJson.find(types => types.brand === this.selectedMaker).models
  )

  changeSelectedMaker = (select: string) => {
    this.selectedMaker = select
    this.modelSelect.nativeElement.value = ''
  }

  registerCar = async (event: Event) => {
    event.preventDefault()
    if (!this.selectedCarType) {
      this.error = 'You must select a car type'
      return
    }
    this.error = ''
    const form = Object.fromEntries(new FormData(event.target as HTMLFormElement).entries())
    try {
      await cars.registerCar({
        type: this.selectedCarType.carType,
        userId: Number(this.driverId),
        make: form['make'].toString(),
        model: form['model'].toString(),
        year: Number(form['year'].toString()),
        registration: form['registration'].toString()

      })
      dialogStore.openDialog(
        ContinueDialog,
        {
          success: true,
          title: 'New driver registration complete',
          body: 'You have sucessfully registered a new driver'
        },
        () =>
          setTimeout(() => {
            this.router.navigate([`/`])
          }, 200)
      )
    } catch (error) {
      this.error = error.message
    }
  }
}

class CarType {
  name: string
  description: string
  seats: number
  paymentMultiplier: number
  selected: boolean
  carType: string
  image: string
}
