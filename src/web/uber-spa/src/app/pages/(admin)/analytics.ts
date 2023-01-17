import dayjs from 'dayjs'
import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { userStore } from '@app/stores'
import DateRangePicker from '@app/components/ui/datepicker/dateRangePicker'
import Analytics from '@app/components/common/analytics'

@Component({
  selector: 'Spending',
  standalone: true,
  imports: [NgIf, DateRangePicker, Analytics],
  template: `
    <div class="max-w-2xl">
      <div class="flex justify-between mb-6">
        <div>
          <h3 class="text-3xl">{{ userStore.isRider ? 'Spending' : 'Earnings'}}</h3>
        </div>
        <DateRangePicker 
          [past]="true" 
          [future]="false"
          [autoClose]="true"
          (onClosed)="getAnalytics()"
          (onDateSelected)="setDates($event)"
          class="inline-block -mt-[26px]"
          >
        </DateRangePicker>
      </div>
      <Analytics 
        [startDate]="startDate" 
        [endDate]="endDate" 
        [userId]="userStore.user.id"
      >
      </Analytics>
    </div>
  `
})
export default class AnalyticsPage {

  userStore = userStore
  startDate: dayjs.Dayjs
  endDate: dayjs.Dayjs

  setDates = ([startDate, endDate]: dayjs.Dayjs[]) => {
    this.startDate = startDate
    this.endDate = endDate
  }

  getAnalytics = () => {
    if (!this.startDate || !this.endDate) return
  }
}