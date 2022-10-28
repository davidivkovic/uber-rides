import { Component, AfterViewInit, ViewChild, ElementRef, NgZone, } from '@angular/core'
import { NgForOf } from '@angular/common'
import { RouterModule } from '@angular/router'

import dayjs from 'dayjs'
import en from 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'

import { watch } from 'usm-mobx'

import Ticket from './components/ticket'
import { computed, watchEffect } from 'src/app/utils'
import store, { dialogStore } from 'src/app/stores'
import Calendar from 'src/app/components/ui/datepicker/calendar'
import DateRangePicker from 'src/app/components/ui/datepicker/dateRangePicker'

import { Dialog } from 'src/app/components/ui/dialog/index'


dayjs.locale(en)
dayjs.extend(relativeTime)

@Component({
  standalone: true,
  imports: [RouterModule, NgForOf, Calendar, Ticket, DateRangePicker],
  template: `
    <!-- {{ track() }} -->
    <div>Hello from tickets/index.ts</div>
    <div>Counter {{ counter }}</div>
    <div>Double Counter {{ doubleCounter() }}</div>
    <div>Store Counter {{ store.count.sum }}</div>
    <div>Store Double Counter {{ store.double }}</div>
    <button (click)="increment()">Increment</button>
    <br>
    <button (click)="store.increase()">Store Increment</button>
    <br>
    <a routerLink="/tickets/99">Go to ticket 99</a>
    <Ticket id="65"></Ticket>

    <!-- <div *ngFor="let todo of todos()">
      Id: {{ todo.id }} Name: {{ todo.name }}
    </div> -->

    <!-- <dialog #dialog class="border transition-all backdrop:bg-black/50">
      <p>Greetings, one and all!</p>
      <form method="dialog">
        <button>OK</button>
      </form>
    </dialog> -->

    <DateRangePicker [autoClose]="false" label="Campaign Duration"></DateRangePicker>
  `
})
export class Index implements AfterViewInit {
  /* properties */
  counter = 0
  tester = 0
  store = store
  month = dayjs().startOf('M')
  previewDate
  selectedDates = []
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>

  addSelectedDate = date => {
    if (this.selectedDates[0] && date.isSame(this.selectedDates[0], 'day')) {
      if (this.selectedDates.length == 1) {
        this.selectedDates = []
      } else if (this.selectedDates.length == 2) {
        this.selectedDates = [date]
      }
      return
    }
    if (
      this.selectedDates.length == 2 ||
      (this.selectedDates.length == 1 && date.isBefore(this.selectedDates[0]))
    ) {
      this.selectedDates = [date]
    } else {
      this.selectedDates = [...this.selectedDates, date]
    }
    // if (selectedDates().length == 2 && props.autoClose) {
    //   setIsOpen(false)
    // }
  }

  /* methods */
  increment = () => this.counter++
  stopTesterWatch = () => { }

  /* calls */
  doubleCounter = computed([() => this.counter], () => this.counter * 2)
  tripleTester = computed([() => this.tester], () => {
    console.log('triple tester')
    return this.tester * 2
  })

  todos = computed(
    () => this.tester,
    () => {
      console.log('evaluated list')
      return [
        { id: 0, name: 'Shopping' },
        { id: 1, name: 'Cooking' },
        { id: 2, name: 'Eating' },
        { id: 3, name: 'Cleaning' }
      ]
    }
  )

  testerWatch = watchEffect(
    [
      () => this.tester,
      () => this.counter
    ],
    (prev, curr) => {
      console.log(`
        Watcher values are: 
          Tester previous: ${prev[0]}, Tester current: ${curr[0]}
          Counter previous: ${prev[1]}, Counter current: ${curr[1]}
      `)
      if (curr[1] > 15) this.stopTesterWatch()
    },
    {},
    stop => this.stopTesterWatch = stop
  )
  // storeWatch = watch(
  //   () => this.store.count.sum,
  //   (prev, curr) => console.log(`Store value is: previous: ${prev} current: ${curr}`)
  // )

  track = () => {
    console.log('rerender')
    // this.testerWatch()
    // this.storeWatch()
  }

  interval = setInterval(() => {
    this.increment()
    // const temp = this.tester
    // this.tester = null
    // this.tester = temp + 1
  }, 1000)

  constructor(zone: NgZone) {
    // console.log(this.month)
    // setTimeout(() => clearInterval(this.interval), 3000)
    watch(this, () => store.count.sum, () => console.log(store.count.sum))
    // dialogStore.openDialog(
    //   Dialog,
    //   { counter: this.counter },
    //   data => console.log(data)
    // )
  }

  ngAfterViewInit() {
    // this.dialog.nativeElement.showModal()
  }
}