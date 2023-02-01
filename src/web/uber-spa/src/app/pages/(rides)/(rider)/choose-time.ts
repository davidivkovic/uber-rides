import { Component } from '@angular/core'
import { Location, NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import dayjs from 'dayjs'
import { ridesStore } from '@app/stores/ridesStore'

@Component({
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div class="w-[400px] h-[700px] flex flex-col bg-white rounded-xl pointer-events-auto">
      <div class="flex justify-between items-center">
        <button (click)="cancel()" class="p-3.5">
          <svg width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="5" y1="12" x2="11" y2="18"></line>
            <line x1="5" y1="12" x2="11" y2="6"></line>
          </svg>
        </button>
        <button (click)="deleteTime()" class="p-3.5 mr-1 text-[15px]">
          Delete
        </button>
      </div>
      <div class="flex flex-col flex-1 px-4 pb-4">
        <h3 class="text-4xl pb-2">When do you want to be picked up?</h3>
        <div class="px-8 pt-3 pb-4">
          <div class="pb-3">
            <p *ngIf="pickupAddress" class="text-center">
              <span class="text-zinc-500 text-[15px] mr-0.5">From</span>
              {{ pickupAddress }}
            </p>
          </div>
          <div *ngIf="tomorrowAllowed" class="relative mb-5">
            <div class="absolute h-full flex items-center left-3.5">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Calendar</title><path fill-rule="evenodd" clip-rule="evenodd" d="M23 8V4h-3V1h-3v3H7V1H4v3H1v4h22zm0 15H1V10h22v13zM8 14H5v3h3v-3z" fill="currentColor"></path></svg>
            </div>
            <select 
              [(ngModel)]="selectedDay"
              (change)="selectedDayChanged()"
              class="text-center text-base cursor-pointer"
              style="text-align: center; text-align-last: center;"
            >
              <option style="text-align: left;">Today</option>
              <option style="text-align: left;">Tomorrow</option>
            </select>
          </div>
          <div class="relative">
            <div class="absolute h-full flex items-center left-3.5">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Clock</title><path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm6 13h-8V4h3v7h5v3z" fill="currentColor"></path></svg>
            </div>
            <select 
              [(ngModel)]="selectedTime"
              class="text-center text-base cursor-pointer"
              style="text-align: center; text-align-last: center;"
            >
              <option *ngFor="let time of allowedTimes" [ngValue]="time" style="text-align: left;">{{ time.format('h:mm A') }}</option>
            </select>
          </div>
        </div>
        <div class="mt-1">
          <div class="flex items-center justify-center space-x-4 pr-4 py-2.5">
            <svg class="shrink-0" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Clock</title><path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm6 13h-8V4h3v7h5v3z" fill="currentColor"></path></svg>
            <p class="leading-tight text-[15px]">Choose your pickup time up to 5 hours in advance</p>
          </div>
          <div class="ml-8 h-px bg-zinc-300"></div>
          <div class="flex items-center justify-center space-x-4 pr-4 py-2.5">
            <svg class="shrink-0" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><title>Hourglass</title><path d="M19 5.5V4h1V1H4v3h1v1.5c0 2.95 1.83 5.47 4.41 6.5A7.002 7.002 0 005 18.5V20H4v3h16v-3h-1v-1.5c0-2.95-1.83-5.47-4.41-6.5A7.002 7.002 0 0019 5.5zM16 4v1.5c0 .53-.11 1.04-.3 1.5H8.3c-.19-.46-.3-.97-.3-1.5V4h8zm0 14.5V20H8v-1.5c0-2.21 1.79-4 4-4s4 1.79 4 4z" fill="currentColor"></path></svg>
            <p class="leading-tight text-[15px]">Additional waiting time for finding a driver is also included</p>
          </div>
        </div>
        <button (click)="confirmTime()" class="mt-auto primary w-full !text-base">Confirm</button>
      </div>
    </div>
  `
})
export default class ChooseTime {

  pickupAddress: string
  tomorrowAllowed = false
  allowedTimes: dayjs.Dayjs[] = []
  now: dayjs.Dayjs
  selectedTime: dayjs.Dayjs
  selectedTimeBackup: dayjs.Dayjs
  selectedDay: 'Today' | 'Tomorrow' = 'Today'
  selectedDayBackup: 'Today' | 'Tomorrow' = 'Today'

  constructor(public route: ActivatedRoute, public router: Router, public location: Location) {
    this.setPickupAddress()
    this.calculateAllowedTimes()
  }

  onActivated() {
    this.setPickupAddress()
    this.calculateAllowedTimes()
    this.selectedDayBackup = this.selectedDay
    this.selectedTimeBackup = this.selectedTime
  }

  setCurrentTime() {
    // this.now = dayjs('2022-12-03 21:13')
    this.now = dayjs()
  }

  calculateAllowedTimes() {
    this.setCurrentTime()
    this.tomorrowAllowed = !this.now.add(5, 'hours').isSame(this.now, 'day')
    this.allowedTimes.length = 0
    const roundedTime = this.now.set('minutes', Math.ceil(this.now.minute() / 5) * 5)
    for (let i = 0; i <= 30; i++) { /* 5h * 10min intervals */
      const time = roundedTime.add(i * 5, 'minutes')
      if (
        this.selectedDay === 'Today' && time.isSame(this.now, 'day') ||
        this.selectedDay === 'Tomorrow' && !time.isSame(this.now, 'day')
      ) {
        this.allowedTimes.push(time.startOf('minute'))
      }
    }
    if (!this.selectedTime || this.now.isAfter(this.selectedTime)) {
      this.selectedTime = this.allowedTimes[0]
    }
    else {
      this.selectedTime = this.allowedTimes.find(t => t.isSame(this.selectedTime, 'minutes'))
    }
  }

  selectedDayChanged() {
    this.selectedTime = null
    this.calculateAllowedTimes()
  }

  setPickupAddress() {
    this.pickupAddress = this.route.snapshot.queryParamMap.get('pickup')
  }

  cancel() {
    this.selectedDay = this.selectedDayBackup
    this.selectedTime = this.selectedTimeBackup
    this.location.back()
  }

  deleteTime() {
    this.selectedTime = null
    ridesStore.setState(store => store.data.scheduledAt = null)
    this.location.back()
  }

  confirmTime() {
    ridesStore.setState(store => store.data.scheduledAt = this.selectedTime)
    this.location.back()
  }

}