import dayjs from 'dayjs'
import { NgIf, CurrencyPipe } from '@angular/common'
import { Component, Input } from '@angular/core'
import { computed, watchEffect } from '@app/utils'
import payments from '@app/api/payments'
import { userStore } from '@app/stores'

@Component({
  selector: 'Analytics',
  standalone: true,
  imports: [NgIf, CurrencyPipe],
  template: `
    <div *ngIf="payments >= 0">
      <!-- <p class="text-xl my-2">Last {{ dateDistanceFormatted() }}</p> -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-3">
        <div class="p-5 bg-[#f1f1f1] rounded-md">
          <p class="text-[15px]">Payments</p>
          <h3 class="text-2xl">{{ payments }}</h3>
        </div>
        <div class="p-5 bg-[#f1f1f1] rounded-md">
          <p class="text-[15px]">Total {{ userStore.isRider ? 'Spending' : 'Earnings'}}</p>
          <h3 class="text-2xl">{{ total | currency:'USD' }}</h3>
        </div>
        <div class="p-5 bg-[#f1f1f1] rounded-md">
          <p class="text-[15px]">Transaction Average</p>
          <h3 class="text-2xl"> {{ txAverage | currency:'USD' }} </h3>
        </div>
        <div class="p-5 bg-[#f1f1f1] rounded-md">
          <p class="text-[15px]">{{ dateDistanceFormatted() }} Average</p>
          <h3 class="text-2xl"> {{ dateAverage | currency:'USD' }} </h3>
        </div>
      </div>
    </div>
    <div *ngIf="payments == null">
      <p class="text-neutral-600">Please select a date range</p>
    </div>
    {{ watcher() }}
  `
})
export default class Analytics {

  userStore = userStore

  @Input() userId: number
  @Input() startDate: dayjs.Dayjs
  @Input() endDate: dayjs.Dayjs

  payments: number
  total: number
  txAverage: number
  dateAverage: number

  dirty = false

  watcher = watchEffect(
    [() => this.startDate, () => this.endDate],
    async () => {
      if (!this.startDate || !this.endDate || this.dirty) return
      this.dirty = true
      const data = await payments.analytics(
        this.userId,
        this.startDate.toISOString(),
        this.endDate.endOf('day').toISOString()
      )
      this.total = data.total
      this.payments = data.payments
      this.txAverage = (data.total / data.payments) || 0

      if (this.endDate.diff(this.startDate, 'day') < 30) {
        this.dateAverage = this.total / this.endDate.diff(this.startDate, 'day')
      }
      else if (this.endDate.diff(this.startDate, 'month') < 12) {
        this.dateAverage = this.total / this.endDate.diff(this.startDate, 'month')
      }
      else {
        this.dateAverage = this.total / this.endDate.diff(this.startDate, 'year')
      }
      this.dirty = false
    }
  )

  dateDistanceFormatted = computed(
    [() => this.startDate, () => this.endDate],
    () => {
      if (!this.startDate || !this.endDate) return ''
      const days = this.endDate.diff(this.startDate, 'day')
      if (days < 30) return 'Daily'
      const months = this.endDate.diff(this.startDate, 'month')
      if (months < 12) return 'Monthly'
      return 'Yearly'
    }
  )
}