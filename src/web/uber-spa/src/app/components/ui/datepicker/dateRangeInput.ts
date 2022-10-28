import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core"
import { NgIf, NgClass } from "@angular/common"

import dayjs from 'dayjs'
import en from 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'

import { computed } from "src/app/utils"

dayjs.locale(en)
dayjs.extend(relativeTime)

const dateFormat = 'ddd, MMM D'

@Component({
  selector: 'DateRangeInput',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgClass],
  template: `
    <div class="inline-block">
      <label *ngIf="label"
        for="range-date-picker"
        class="cursor-pointer select-none text-[13px] font-medium text-neutral-900"
      >
        {{ label }}
      </label> 
      <br>
      <button
        #buttonRef
        id="range-date-picker"
        (mousedown)="onmousedown.emit()"
        (click)="onclick.emit()"
        (focus)="onfocus.emit()"
        class="group mt-0.5 inline-flex h-11 w-max items-center border border-neutral-300 bg-white px-5 pr-6 text-[13px] font-medium transition hover:border-neutral-600"
        [ngClass]="{ '!border-neutral-600': isOpen }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="-ml-1.5 mr-2.5 -mt-px h-5 w-5 text-neutral-400 transition group-hover:text-neutral-600"
          [ngClass]="{ '!text-neutral-600': isOpen }"
        >
          <path
            fill-rule="evenodd"
            d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <span
            [ngClass]="[
              'transition',
              startDate ? 
                'font-medium text-neutral-900' :
                'font-normal text-neutral-400 group-hover:text-neutral-600',
              isOpen ? '!text-neutral-600' : ''
            ]"
          >
            {{ formattedStartDate() }}
          </span>
          <span class="mx-1.5 font-normal text-neutral-400">&#8211;</span>
          <span
            [ngClass]="[
              'transition',
              endDate ? 
                'font-medium text-neutral-900' :
                'font-normal text-neutral-400 group-hover:text-neutral-600',
              isOpen ? '!text-neutral-600' : ''
            ]"
          >
            {{ formattedEndDate() }}
          </span>
        </div>
      </button>
    </div>
  `
})
export default class DateRangeInput implements AfterViewInit {
  @Input() label: string
  @Input() isOpen: boolean
  @Input() startDate: dayjs.Dayjs
  @Input() endDate: dayjs.Dayjs

  @Output() onmousedown = new EventEmitter()
  @Output() onclick = new EventEmitter()
  @Output() onfocus = new EventEmitter()
  @Output() onButtonRef = new EventEmitter<HTMLElement>()

  @ViewChild('buttonRef') buttonRef: ElementRef<HTMLButtonElement>

  formattedStartDate = computed(
    () => this.startDate ?? '',
    () => this.startDate?.format(dateFormat) ?? 'Start date'
  )

  formattedEndDate = computed(
    () => this.endDate ?? '',
    () => this.endDate?.format(dateFormat) ?? 'End date'
  )

  ngAfterViewInit() {
    this.onButtonRef.emit(this.buttonRef.nativeElement)
  }
}