import { Component } from '@angular/core'
import { dialogStore, notificationStore } from '@app/stores'
import payments from '@app/api/payments'
import { NgIf, NgFor } from '@angular/common'
import { PaymentMethodDialog } from './components/paymentMethodDialog'
import { CardNumberHidden } from './components/pipes'
import dayjs from 'dayjs'
import card from 'creditcards'
import creditCardLogos from '@app/../assets/files/credit-cards.json'

@Component({
  standalone: true,
  imports: [CardNumberHidden, NgIf, NgFor],
  template: `
    <div>
      <h3 class="text-3xl">Saved payment options</h3>
      <div
        *ngFor="let card of cards"
        class="relative group w-[400px] flex flex-col justify-between  bg-gray-100 rounded-lg h-[220px] mt-10 p-6"
      >
        <div>
          <div
            class="absolute hidden group-hover:flex items-center justify-center bg-black/[0.6] w-[400px] h-[220px] top-0 left-0 rounded-lg "
          >
            <svg
              (click)="removeCard(card)"
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
            <div>Credit / debit card</div>
            <img class="w-16" [src]="card.image" />
          </div>
          <div class="mt-3 text-xl tracking-wider">{{ card.cardNumber | cardNumberHidden }}</div>
        </div>
        <div class="flex justify-between">
          <div>
            <div class="text-sm text-gray-400">Name</div>
            <div>{{ card.nickname }}</div>
          </div>
          <div class="flex space-x-3">
            <div>
              <div class="text-sm text-gray-400">Expire</div>
              <div>{{ card.expirationDate }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">CVV</div>
              <div>{{ card.cvv }}</div>
            </div>
          </div>
        </div>
      </div>
      <div
        *ngIf="paypal"
        class="relative group w-[400px] bg-gray-100 rounded-lg h-[220px] mt-10 p-6"
      >
        <div
          class="absolute hidden group-hover:flex justify-center items-center p-6 bg-black/[0.6] w-[400px] h-[220px] top-0 left-0 rounded-lg "
        >
          <svg
            (click)="removePaypal()"
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
          <div>Paypal</div>
          <img
            class="w-16"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png"
          />
        </div>
        <div class="flex justify-between mt-24">
          <div>
            <div class="text-sm text-gray-400">Email address</div>
            <div>{{ paypal.email }}</div>
          </div>
        </div>
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

  paypal: any
  cards = []
  notificationStore = notificationStore

  async ngOnInit() {
    await this.fetchData()
  }

  fetchData = async () => {
    this.cards = await payments.getCards()
    this.cards.forEach(card => {
      card.expirationDate = dayjs(card.expirationDate).format('MM/YY')
      const type = this.card.card.type(card.cardNumber.split(' ').join(''))
      card.image = creditCardLogos[type]
    })
    this.paypal = await payments.getPaypal()
  }

  addMethod = async () => {
    dialogStore.openDialog(PaymentMethodDialog, {}, async () => await this.fetchData())
  }

  removeCard = async (card: any) => {
    try {
      await payments.removeCard(card.id)
      notificationStore.show('Card successfully removed.')
      this.cards = this.cards.filter(item => item.id !== card.id)
    } catch (error) {
      console.log(error)
    }
  }

  removePaypal = async () => {
    try {
      await payments.removePaypal()
      notificationStore.show('Paypal successfully removed.')
      this.paypal = null
    } catch (error) {
      console.log(error)
    }
  }
}
