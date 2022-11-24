import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core'
import { NgForOf, NgIf, NgClass } from '@angular/common'

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import localeData from 'dayjs/plugin/localeData'

import { classNames, computed } from '@app/utils'

dayjs.extend(isBetween)
dayjs.extend(localeData)

@Component({
  selector: 'Calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, NgIf, NgClass],
  template: `
    <div>
      <div class="mb-3 select-none text-center text-sm font-semibold">
        {{ month.format('MMMM YYYY') }}
      </div>
      <table class="border-collapse text-center text-[13px]">
        <thead>
          <tr class="select-none">
            <th 
              *ngFor="let day of weekdays; trackBy: ngForIdentity" 
              class="h-9 w-9 font-medium"
            >
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let week of weeks(); trackBy: ngForIdentity">
            <td 
              *ngFor="let day of week; trackBy: ngForIdentity" 
              class="h-9 w-9 select-none p-0 text-[13px]"
            >
              <span 
                *ngIf="day"
                (click)="onDateSelected.emit(day)"
                (mouseenter)="onPreviewDateChange.emit(day)"
                (mouseleave)="onPreviewDateChange.emit(null)"
                [ngClass]="cellClass(day)"
              >
                {{ day.date() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export default class Calendar {
  @Input() month: dayjs.Dayjs
  @Input() previewDate: dayjs.Dayjs
  @Input() selectedDates: dayjs.Dayjs[]

  @Output() onDateSelected = new EventEmitter<dayjs.Dayjs>()
  @Output() onPreviewDateChange = new EventEmitter<dayjs.Dayjs>()

  weekdays: dayjs.WeekdayNames
  today = dayjs()

  ngForIdentity = (index: number, item: any) => index

  weeks = computed(
    () => this.month,
    () => {
      const calendarWeeks = [[], [], [], [], [], []]
      for (let week = 0; week < 6; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          const date = this.month.add(
            week * 7 + dayOfWeek - ((this.month.day() + 6) % 7),
            'day'
          )
          if (
            week == 0 && dayOfWeek < (this.month.day() + 6) % 7 ||
            date.month() != this.month.month()
          ) {
            calendarWeeks[week].push(null)
          } else {
            calendarWeeks[week].push(date)
          }
        }
      }
      return calendarWeeks
    }
  )

  cellClass = (day: dayjs.Dayjs) => classNames(
    'inline-block w-9 leading-9',
    // day.isSame(this.today, 'day') ? 'text-indigo-700' : '',
    this.selectedDates?.some(d => d.isSame(day, 'day')) && 'bg-black !text-white hover:bg-black',
    day.isBefore(this.today, 'day') ? 'pointer-events-none text-neutral-400' : 'cursor-pointer',
    day && this.selectedDates?.every(d => d.date() != day.date()) && 'hover:bg-neutral-100',
    (
      (
        this.selectedDates?.length < 2 &&
        this.selectedDates[0] &&
        this.previewDate?.isAfter(
          this.selectedDates[0],
          'day'
        ) &&
        day.isBetween(
          this.selectedDates[0],
          this.previewDate,
          'day',
          "(]"
        )
      )
      ||
      (
        this.selectedDates?.length == 2 &&
        day.isBetween(
          this.selectedDates[0],
          this.selectedDates[1],
          'day'
        )
      )
    ) && 'bg-[#f7f7f7]'
  )

  constructor() {
    this.weekdays = dayjs.weekdaysMin()
    this.weekdays.push(this.weekdays.shift()) /* Move monday to first day of week */
  }
}