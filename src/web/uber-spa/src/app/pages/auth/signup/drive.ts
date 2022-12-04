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
          <option value="" selected disabled hidden>--Select car maker--</option>
          <option *ngFor="let maker of types" [value]="maker">
            {{ maker }}
          </option>
        </select>
        <select required #model name="model" class="">
          <option value="" selected disabled hidden>--Select car model--</option>
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
          You must decide what type of car the driver has. His earnings are depend on it.
        </p>
      </div>
      <div *ngIf="carTypes.length !== 0" class="flex space-x-5">
        <div
          *ngFor="let carType of carTypes; let i = index"
          (click)="selectCarType(carType)"
          [ngClass]="{
            'outline outline-2 bg-stone-200 transition-none': carType.name === selectedCarType?.name
          }"
          class="rounded-xl bg-[#eeeeee] p-5 w-full hover:bg-stone-200 cursor-pointer transition-all duration-150"
        >
          <img [src]="carImages[i]" class="mx-auto" />
          <div class="flex justify-between">
            <p class="font-bold text-lg">{{ carType.name }}</p>
            <div class="flex space-x-2 font-medium">
              <div class="flex  items-center font-medium">
                {{ carType.seats }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-user"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  stroke-width="2.8"
                  stroke="#2c3e50"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                </svg>
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

  carImages = [
    'https://i.pinimg.com/originals/41/ae/f1/41aef11685c001bc3a19aaacfcf9a145.png',
    'https://pngimg.com/uploads/audi/audi_PNG1715.png',
    'https://media-assets.mazda.eu/image/upload/c_fill,w_768,q_auto,f_auto/mazdauk/globalassets/cars/mazda-mx-30/clearcut_cc/mx-30-clear-cut2.png?rnd=49bb03'
  ]

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
    console.log(form)
    try {
      await cars.registerCar({
        type: this.selectedCarType.type,
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
  type: string
}
