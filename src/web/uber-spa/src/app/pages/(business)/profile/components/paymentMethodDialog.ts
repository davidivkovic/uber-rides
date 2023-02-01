import { Dialog } from '@app/components/ui/dialog'
import { Component } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import Paypal from './paypal'
import { NewCard } from './card'

@Component({
  standalone: true,
  imports: [NewCard, NgFor, NgIf, Paypal],
  template: `
    <div class="w-[450px] h-[550px] p-2">
      <div *ngIf="!optionChosen; else other_content">
        <h1 class="text-2xl mb-7">Add a payment method</h1>
        <div
          [id]="'add-payment-method-' + option.id"
          (click)="displayNewMethod(option)"
          *ngFor="let option of options"
          class="w-full h-16 flex text-sm justify-between items-center cursor-pointer"
        >
          <div class="flex space-x-5 items-center">
            <img [src]="option.image" />
            <div>{{ option.name }}</div>
          </div>
          <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" color="#AFAFAF">
            <path d="M16.9 12l-4.6 6H8.5l4.6-6-4.6-6h3.8l4.6 6z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
      <ng-template #other_content>
        <Paypal
          *ngIf="optionChosen.id === 'paypal'"
          (oncancel)="showOptions()"
          (onsuccess)="closeDialog()"
          [setDefault]="props.setDefault"
        ></Paypal>
        <NewCard
          *ngIf="optionChosen.id === 'card'"
          (oncancel)="showOptions()"
          (onsuccess)="closeDialog()"
          [setDefault]="props.setDefault"
        ></NewCard>
      </ng-template>
    </div>
  `
})
export class PaymentMethodDialog extends Dialog {
  optionChosen = null
  options = [
    {
      id: 'card',
      name: 'Debit or credit card',
      image: 'https://d3i4yxtzktqr9n.cloudfront.net/web-payments-experience/a90ee32180aec8e4.svg'
    },
    {
      id: 'paypal',
      name: 'Paypal',
      image: 'https://d3i4yxtzktqr9n.cloudfront.net/web-payments-experience/29c3a6a2d4cd40fa.svg'
    }
  ]

  closeDialog = () => {
    this.close('ok')
  }

  showOptions = () => {
    this.optionChosen = null
  }

  displayNewMethod = (option: any) => {
    this.optionChosen = option
  }
}
