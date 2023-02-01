import { Component } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { Dialog } from '@app/components/ui/dialog'
import { dialogStore } from '@app/stores/dialogStore'
import { CardNumberHidden } from './pipes'
import payments from '@app/api/payments'
import methodLogos from '@app/../assets/files/payment-methods-icon.json'
import { PaymentMethodDialog } from './paymentMethodDialog'

declare const braintree
declare const paypal

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CardNumberHidden],
  selector: 'PayDialog',
  template: `
    <div class="w-[450px] h-[550px] p-2 justify-between flex flex-col">
      <div class="h-full flex flex-col">
        <h1 class="text-2xl mb-7 h-6 sticky">Payment options</h1>
        <div class="divide-y-[1px] overflow-y-auto flex-1 w-[450px] overflow-x-hidden">
          <div
            *ngFor="let method of methods"
            class="w-[450px] h-[72px] cursor-pointer flex items-center pr-10"
            (click)="setDefaultMethod(method)"
          >
            <div class="w-[40px] h-full flex items-center justify-top">
              <img
                [src]="methodLogos[method.typeDetails]"
                alt="Payment method icon"
                class="h-[22px] w-[22px] object-contain"
              />
            </div>
            <div class="flex justify-between flex-1">
              <div class="flex space-x-3 items-baseline">
                <div class="text-sm">{{ method.name }}</div>
                <div class="text-xs text-gray-500">{{ method.email }}</div>
              </div>
              <div *ngIf="currentDefaultMethod === method">
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                  <title>Checkmark small</title>
                  <path
                    d="M10.5 17.6l-6.1-6 2.2-2.2 3.9 4 7.4-7.5 2.2 2.2-9.6 9.5z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <button
            id="pay-dialog-add-payment-method"
            (click)="addMethod()"
            class="w-full !p-0 rounded-none text-left h-[72px] flex space-x-5 items-center"
          >
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
              <title>Plus small</title>
              <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" fill="currentColor"></path>
            </svg>
            <div class="mt-1 text-sm">Add payment method</div>
          </button>
        </div>
        <button 
          id="pay-dialog-save-button"
          (click)="saveDefaultMethod()" 
          class="flex items-center justify-center primary w-full !text-lg"
        >
          Save
        </button>
      </div>
    </div>
  `
})
export class PayDialog extends Dialog {
  methodLogos = methodLogos

  error = ''

  methods = []
  currentDefaultMethod = null

  async ngOnInit() {
    this.fetchData()
  }

  async fetchData() {
    this.methods = await payments.getMethods()
    this.methods.forEach(method => {
      if (method.type == 'CARD') {
        method.name = `${method.typeDetails} - ${method.cardNumber.slice(15)} (${method.nickname})`
      }
    })
    this.currentDefaultMethod = this.methods.filter(method => method.default)[0]
  }

  setDefaultMethod(method: object) {
    this.currentDefaultMethod = method
  }

  async saveDefaultMethod() {
    try {
      await payments.changeDefault(this.currentDefaultMethod.id)
      this.close('ok')
    } catch (err) {
      this.error = err
    }
  }

  addMethod() {
    dialogStore.openDialog(
      PaymentMethodDialog,
      { setDefault: true },
      async () => {
        await Promise.all([this.fetchData(), this.props.refetchDefaultMethod()])
        window.detector.detectChanges()
      }
    )
  }
}
