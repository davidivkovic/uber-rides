import { CardNumber, Date } from './pipes'
import { CloseButton } from '@app/components/ui/base/closeButton'
import { FormsModule } from '@angular/forms'
import { Component, EventEmitter, Output } from '@angular/core'
import countries from '@app/../assets/files/countries.json'
import payments from '@app/api/payments'
import { NgFor } from '@angular/common'
import { notificationStore } from '@app/stores'

@Component({
  standalone: true,
  selector: 'NewCard',
  imports: [CloseButton, CardNumber, FormsModule, Date, NgFor],
  template: `
    <div class="space-y-5 px-5 p-7 max-w-sm">
      <div class="space-y-6">
        <h2 class="text-3xl font-normal">Add credit or debit card</h2>
        <form (ngSubmit)="addCard()" ngNativeValidate class="text-gray-800 space-y-4">
          <div>
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
              (keydown)="checkValue($event)"
            />
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
              <option value="" selected disabled hidden>--Select country--</option>
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
          <p class="text-red-600 text-center text-sm">{{ error }}</p>
          <button type="submit" class="primary w-full">Add card</button>
        </form>
      </div>
      <button type="button" (click)="oncancel.emit()" class="secondary w-full">Cancel</button>
    </div>
  `
})
export class NewCard {
  @Output() oncancel = new EventEmitter()
  @Output() onsuccess = new EventEmitter()

  cardData = {
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    nickname: '',
    country: ''
  }

  error = ''
  countries = countries

  checkValue = (event: KeyboardEvent) => {
    const keyCode = event.key
    const allowed = [...[...Array(10).keys()].map(i => i.toString()), 'Backspace']
    if(!allowed.includes(keyCode)) event.preventDefault()
  }

  addCard = async () => {
    this.cardData.expirationDate =
      this.cardData.expirationDate.slice(0, 2) + '/' + this.cardData.expirationDate.slice(2)
    try {
      await payments.addCard(this.cardData)
      notificationStore.show('New card successfully added.')
      this.onsuccess.emit()
    } catch (error) {
      this.error = error
    }
  }
}
