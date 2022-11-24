import { ChangeDetectorRef, ElementRef, Component, Input, ChangeDetectionStrategy, ViewChild } from '@angular/core'
import { NgIf } from '@angular/common'

import dayjs from 'dayjs'
import en from 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'

import DateRangeInput from './dateRangeInput'
import Calendar from './calendar'
import { computed } from '@app/utils'

dayjs.locale(en)
dayjs.extend(relativeTime)

const dateFormat = 'ddd, MMM D'

@Component({
  selector: 'DateRangePicker',
  standalone: true,
  imports: [NgIf, DateRangeInput, Calendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #root class="relative w-min">
      <DateRangeInput
        [label]="label"
        [startDate]="selectedDates?.[0]"
        [endDate]="selectedDates?.[1]"
        [isOpen]="isOpen"
        (onButtonRef)="onButtonRef($event)"
        (mousedown)="mouseDown = true"
        (click)="toggleIsOpen()"
        (focus)="
          !mouseDown && !isOpen && toggleIsOpen();
          mouseDown = false
        "
      >
      </DateRangeInput>
      <div 
        #datePicker
        *ngIf="isOpen"
        id="calendar-wrapper"
        class="absolute z-50 mt-1.5 border bg-white p-5 pb-4"
      >
        <div id="calendar" class="relative">
          <button
            *ngIf="!leftMonth.isSame(today, 'month')"
            id="previous-button"
            (click)="toPreviousMonth()"
            class="absolute left-0 text-neutral-400 hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="mx-0.5 mb-1 -mt-px h-6 w-6 p-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            id="next-button"
            (click)="toNextMonth()"
            class="absolute right-0 text-neutral-400 hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="mx-0.5 mb-1 -mt-px h-6 w-6 p-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <div id="calendar-content" class="flex">
            <Calendar
              id="left-calendar"
              [month]="leftMonth"
              [previewDate]="previewDate"
              [selectedDates]="selectedDates"
              (onDateSelected)="addSelectedDate($event)"
              (onPreviewDateChange)="previewDate = $event"
            ></Calendar>
            <Calendar
              id="right-calendar"
              class="pl-4"
              [month]="rightMonth()"
              [previewDate]="previewDate"
              [selectedDates]="selectedDates"
              (onDateSelected)="addSelectedDate($event)"
              (onPreviewDateChange)="previewDate = $event"
            ></Calendar>
          </div>
          <div
            id="calendar-footer"
            class="mt-2 select-none pt-2.5 text-center text-[13px] font-medium text-neutral-800"
          >
            {{ formattedStartDate() }}
            <span class="mx-1.5 font-normal text-neutral-400">&#8211;</span>
            {{ formattedEndDate() }} {{ formattedDuration() }}
          </div>
        </div>
      </div>
    </div>
  `
})
export default class DateRangePicker {

  constructor (private changeDetector: ChangeDetectorRef) {}

  open: boolean
  @Input() set isOpen(value: boolean) {
    this.open = value
    this.changeDetector.markForCheck()
  } 
  get isOpen() {
    return this.open
  }

  @Input() autoClose: boolean
  @Input() label: string

  @ViewChild('root') root: ElementRef<HTMLElement>
  @ViewChild('datePicker') datePicker: ElementRef<HTMLElement>

  dateInput: HTMLButtonElement
  onButtonRef = (ref: HTMLElement) => this.dateInput = ref as HTMLButtonElement

  mouseDown = false
  today = dayjs()
  previewDate: dayjs.Dayjs
  selectedDates: dayjs.Dayjs[] = []

  leftMonth = dayjs().startOf('M')
  rightMonth = computed(() => this.leftMonth, () => this.leftMonth.add(1, 'M'))

  endDate = computed(
    [() => this.selectedDates.length, () => this.previewDate, () => this.selectedDates[1]],
    () => {
      if (
        this.selectedDates.length == 2 
        ||
        (this.selectedDates.length > 0 &&
         this.previewDate &&
         this.previewDate.isAfter(this.selectedDates[0], 'day')
        )
      ) {
        return this.selectedDates[1] ?? this.previewDate
      }
      return null
    }
  )

  formattedStartDate = computed(
    [() => this.selectedDates[0], () => this.previewDate],
    () =>
      this.selectedDates[0]?.format(dateFormat) ??
      this.previewDate?.format(dateFormat) ??
      'Start date'
  )

  formattedEndDate = computed(
    this.endDate,
    () => this.endDate()?.format(dateFormat) ?? 'End date'
  )

  formattedDuration = computed(
    [this.endDate, () => this.selectedDates[0]],
    () => this.endDate() ? `(${this.selectedDates[0].to(this.endDate(), true)})` : ''
  )

  addSelectedDate = (date: dayjs.Dayjs) => {
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
    if (this.selectedDates.length == 2 && this.autoClose) {
      this.isOpen = false
    }
  }

  toNextMonth = () => this.leftMonth = this.leftMonth.add(1, 'M')
  toPreviousMonth = () => this.leftMonth = this.leftMonth.subtract(1, 'M')

  focusChange = () =>
    this.isOpen && !this.root.nativeElement.contains(document.activeElement) && this.toggleIsOpen()

  clickOutside = e => {
    if (
      !this.datePicker?.nativeElement.contains(e.target) &&
      !this.dateInput.contains(e.target)
    ) {
      this.toggleIsOpen()
    }
  }

  toggleIsOpen = () => {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      document.addEventListener('focus', this.focusChange, { capture: true })
      document.addEventListener('click', this.clickOutside, { capture: true })
    } else {
      document.addEventListener('focus', this.focusChange, { capture: true })
      document.removeEventListener('click', this.clickOutside, { capture: true })
    }
  }
}
