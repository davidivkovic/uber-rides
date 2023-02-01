import { CardNumber, Date } from './pipes'
import { NgFor, NgIf } from '@angular/common'
import { CloseButton } from '@app/components/ui/base/closeButton'
import { FormsModule } from '@angular/forms'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import countries from '@app/../assets/files/countries.json'
import payments from '@app/api/payments'
import { LoadingOverlay } from './loadingOverlay'
import { notificationStore } from '@app/stores'
import cards from "creditcards"
import methodLogos from '@app/../assets/files/payment-methods.json'

declare const braintree

@Component({
  standalone: true,
  selector: 'NewCard',
  imports: [CloseButton, CardNumber, FormsModule, Date, NgFor, NgIf, LoadingOverlay],
  template: `
    <div class="h-[534px] space-y-2 w-full flex flex-col relative">
      <div class="space-y-6 flex flex-col flex-1">
        <h2 class="text-2xl font-normal">Add credit or debit card</h2>
        <form id="new-car-form" (ngSubmit)="addCard()" ngNativeValidate class="text-gray-800 flex flex-1 flex-col">
          <div class="space-y-4">
            <div class="relative">
              <label for="card-number">Card number</label>
              <input
                required
                [ngModel]="cardData.cardNumber | cardNumber"
                (ngModelChange)="cardData.cardNumber = $event"
                name="cardNumber"
                type="tel"
                minlength="19"
                maxlength="19"
                id="card-number"
                (keydown)="checkCardValue($event)"
              />
              <div
                *ngIf="currentCardImage"
                class="absolute top-8 right-3 w-10 bg-white rounded-md p-1 h-7 flex justify-center"
              >
                <img [src]="currentCardImage" class="object-contain" />
              </div>
            </div>
            <div class="flex justify-between gap-4">
              <div>
                <label for="date">Exp. date</label>
                <input
                  required
                  type="text"
                  [ngModel]="cardData.expirationDate | expDate"
                  name="date"
                  (ngModelChange)="cardData.expirationDate = $event"
                  type="text"
                  oninput="this.value =
                        this.value.replace(/[^0-9.]/g, '');"
                  maxlength="5"
                  minlength="5"
                  id="date"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label for="code">CVV</label>
                <input
                  name="cvv"
                  required
                  id="cvv"
                  type="text"
                  maxlength="3"
                  minlength="3"
                  [(ngModel)]="cardData.cvv"
                  (keydown)="checkValue($event)"
                />
              </div>
            </div>
            <div>
              <label for="country">Country</label>
              <select required id="country" [(ngModel)]="cardData.country" name="country">
                <option value="" selected disabled hidden>Select country</option>
                <option *ngFor="let country of countries" [value]="country.name">
                  {{ country.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="nickname">Nickname</label>
              <input
                required
                type="text"
                maxlength="20"
                id="nickname"
                name="nickname"
                [(ngModel)]="cardData.nickname"
                placeholder="e.g. joint account or work card"
              />
            </div>
          </div>
          <div class="mt-auto space-y-1">
            <p class="text-red-600 text-center text-sm">{{ error }}</p>
            <button type="submit" class="primary w-full">Add card</button>
            <button type="button" (click)="oncancel.emit()" class="secondary w-full">Cancel</button>
          </div>
        </form>
      </div>
      <LoadingOverlay *ngIf="saving" class="absolute h-full w-full"></LoadingOverlay>
    </div>
  `
})
export class NewCard {
  @Input() setDefault: boolean;

  @Output() oncancel = new EventEmitter()
  @Output() onsuccess = new EventEmitter()

  cards = cards
  currentCardImage = ''
  token = ''
  braintreeLoaded = false
  saving = false

  cardData = {
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    nickname: '',
    country: ''
  }

  error = ''
  countries = countries

  async ngAfterViewInit() {
    this.generateToken()
    this.addBraintreeScript()
  }

  checkCardValue = (event: KeyboardEvent) => {
    this.checkValue(event)
    const joined = this.cardData.cardNumber.split(' ').join('')
    const filled = joined.padEnd(16, '0')
    const type = this.cards.card.type(filled)
    this.currentCardImage = methodLogos[type]
  }

  checkValue = (event: KeyboardEvent) => {
    const keyCode = event.key
    const allowed = [...[...Array(10).keys()].map(i => i.toString()), 'Backspace']
    if (!allowed.includes(keyCode)) event.preventDefault()
  }

  addCard = async () => {
    try {
      await this.addCardBraintree()
    } catch (error) {
      this.error = error
    }
  }

  addCardServer = async (nonce: string) => {
    try {
      const month = Number(this.cardData.expirationDate.slice(0, 2))
      const year = Number('20' + this.cardData.expirationDate.slice(2))
      const { cardNumber, cvv, nickname, country } = this.cardData
      await payments.addCard({
        cardNumber,
        month,
        year,
        cvv,
        country,
        nickname,
        nonce,
        setDefault: this.setDefault
      })

      notificationStore.show('New card successfully added.')
      this.onsuccess.emit()
    } catch (error) {
      this.error = error
    }
  }

  generateToken = async () => {
    this.token = await payments.generatePaypalToken()
  }

  addBraintreeScript = async () => {
    const script = Object.assign(document.createElement('script'), {
      async: true,
      src: 'https://js.braintreegateway.com/web/3.88.4/js/client.min.js',
      id: 'braintree',
      onload: () => (this.braintreeLoaded = true)
    })

    document.head.appendChild(script)
  }

  addCardBraintree = async () => {
    braintree.client.create(
      {
        authorization: this.token
      },
      (clientErr, clientInstance) => {
        const data = {
          creditCard: {
            number: this.cardData.cardNumber.split(' ').join(''),
            expirationDate: '06/2023',
            cvv: this.cardData.cvv,
            options: { validate: false }
          }
        }
        this.saving = true
        clientInstance.request(
          {
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
            data: data
          },
          async (requestErr, response) => {
            if (requestErr) {
              throw new Error(requestErr)
            }
            this.addCardServer(response.creditCards[0].nonce)
          }
        )
      }
    )
  }
}
