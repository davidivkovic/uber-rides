import { Component, Input } from '@angular/core'
import { dialogStore, notificationStore } from '@app/stores'
import payments from '@app/api/payments'
import { NgIf, NgFor } from '@angular/common'
import { PaymentMethodDialog } from './components/paymentMethodDialog'
import { CardNumberHidden } from './components/pipes'
import card from 'creditcards'
import methodLogos from '@app/../assets/files/payment-methods.json'
import dayjs from 'dayjs'

@Component({
  standalone: true,
  imports: [CardNumberHidden, NgIf, NgFor],
  template: `
    <div>
      <h3 class="text-3xl">Saved payment methods</h3>
      <div
        *ngFor="let method of methods"
        class="relative group w-[400px] flex flex-col justify-between  bg-gray-100 rounded-lg h-[220px] mt-10 p-6"
      >
        <div>
          <div
            class="absolute hidden group-hover:flex items-center justify-center bg-black/[0.6] w-[400px] h-[220px] top-0 left-0 rounded-lg "
          >
            <svg
              (click)="removeMethod(method)"
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-trash text-white cursor-pointer h-14 w-14 p-2"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="4" y1="7" x2="20" y2="7"></line>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
            </svg>
          </div>
          <div class="flex justify-between items-center">
            <div>{{ method.name }}</div>
            <img class="w-16" [src]="method?.image" />
          </div>
          <div *ngIf="method.type === 'card'" class="mt-3 text-xl tracking-wider">
            {{ method.cardNumber | cardNumberHidden }}
          </div>
        </div>
        <div *ngIf="method.type === 'card'; else paypal" class="flex justify-between">
          <div>
            <div class="text-sm text-gray-400">Name</div>
            <div>{{ method.nickname }}</div>
          </div>
          <div class="flex space-x-3">
            <div>
              <div class="text-sm text-gray-400">Expires</div>
              <div>{{ method.expirationDate }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">CVV</div>
              <div>{{ method.cvv }}</div>
            </div>
          </div>
        </div>
        <ng-template #paypal>
          <div>
            <div class="text-sm text-gray-400">Email</div>
            <div>{{ method.email }}</div>
          </div>
        </ng-template>
      </div>
      <button
        (click)="addMethod()"
        class="w-full mt-5 rounded-none text-left h-20 border-b-2 border-gray-200 flex space-x-5 items-center"
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
          <title>Plus small</title>
          <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" fill="currentColor"></path>
        </svg>
        <div class="mt-1">Add payment method</div>
      </button>
    </div>
  `
})
export default class Payment {
  card = card

  methods = []
  notificationStore = notificationStore

  async ngOnInit() {
    await this.fetchData()
  }

  fetchData = async () => {
    try {
      this.methods = await payments.getMethods()
      this.methods.forEach(m => {
        if (m.cardNumber) {
          m.type = 'card'
          m.name = 'Credit / debit card'
          const type = this.card.card.type(m.cardNumber.split(' ').join(''))
          m.image = methodLogos[type]
          m.expirationDate = dayjs(m.expirationDate).format('MM/YY')
        } else {
          m.type = 'paypal'
          m.name = 'Paypal'
          m.image = methodLogos['paypal']
        }
      })
    } catch (error) {}
  }

  addMethod = async () => {
    dialogStore.openDialog(PaymentMethodDialog, {}, async () => await this.fetchData())
  }

  removeMethod = async (method: any) => {
    try {
      await payments.removePaymentMethod(method.id)
      notificationStore.show('Payment method successfully removed.')
      this.methods = this.methods.filter(item => item.id !== method.id)
    } catch (error) {
      console.log(error)
    }
  }
}
