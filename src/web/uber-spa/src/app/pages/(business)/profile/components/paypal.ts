import { Component, EventEmitter, Output, ViewChild } from '@angular/core'
import { watchEffect } from '@app/utils'
import payments from '@app/api/payments'
import { notificationStore } from '@app/stores'
import { NgIf } from '@angular/common'

declare const braintree
declare const paypal

@Component({
  selector: 'Paypal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="h-full flex flex-col justify-between">
      <div>
        {{ scriptsLoaded() }}
        {{ buttonRendered() }}
        <h1 class="text-2xl ">Add PayPal</h1>
        <p class="mt-5">You will be re-directed to PayPal to verify your account.</p>
      </div>
      <div class="flex flex-col justify-end mt-20 space-y-1">
        <p class="text-red-600 text-center text-sm">{{ error }}</p>
        <div class="rounded-md overflow-clip">
          <div #pp id="paypal-button" class="-mb-2"></div>
        </div>
        <button *ngIf="loadingButton" disabled class="secondary">PayPal loading...</button>
        <button (click)="oncancel.emit()" class="secondary w-full">Cancel</button>
      </div>
    </div>
  `
})
export default class Paypal {
  @ViewChild('pp') paypalButton

  braintreeLoaded = false
  paypalLoaded = false

  loadingButton = true

  error = ''
  token = ''

  @Output() oncancel = new EventEmitter()
  @Output() onsuccess = new EventEmitter()

  async ngAfterViewInit() {
    this.generateToken()
    this.addPaypalScript()
  }

  generateToken = async () => {
    this.token = await payments.generatePaypalToken()
  }

  addPaypalScript = async () => {
    const script = Object.assign(document.createElement('script'), {
      async: true,
      src: 'https://js.braintreegateway.com/web/3.88.4/js/client.min.js',
      id: 'braintree',
      onload: () => (this.braintreeLoaded = true)
    })

    const paypalScript = Object.assign(document.createElement('script'), {
      async: true,
      src: 'https://js.braintreegateway.com/web/3.88.4/js/paypal-checkout.min.js',
      id: 'paypalScript',
      onload: () => (this.paypalLoaded = true)
    })

    document.head.appendChild(script)
    document.head.appendChild(paypalScript)
  }

  scriptsLoaded = watchEffect(
    [() => this.braintreeLoaded, () => this.paypalLoaded, () => this.token],
    () => {
      if (this.braintreeLoaded && this.paypalLoaded && this.token) {
        this.initPaypal()
      }
    }
  )

  buttonRendered = watchEffect(
    () => this.paypalButton?.nativeElement.innerHTML,
    () => {
      if (this.paypalButton?.nativeElement.innerHTML) this.loadingButton = false
    }
  )

  initPaypal = () => {
    braintree.client.create(
      {
        authorization: this.token
      },
      (clientErr, clientInstance) => {
        if (clientErr) {
          console.error('Error creating client:', clientErr)
          return
        }
        braintree.paypalCheckout.create(
          {
            client: clientInstance
          },
          (paypalCheckoutErr, paypalCheckoutInstance) => {
            paypalCheckoutInstance.loadPayPalSDK(
              {
                vault: true
              },
              () => {
                paypal
                  .Buttons({
                    style: {
                      color: 'blue',
                      label: 'paypal',
                      shape: 'rect',
                      height: 48,

                    },
                    fundingSource: paypal.FUNDING.PAYPAL,

                    createBillingAgreement() {
                      return paypalCheckoutInstance.createPayment({
                        flow: 'vault' // Required
                      })
                    },

                    onApprove: (data, actions) => {
                      return paypalCheckoutInstance.tokenizePayment(data, async (err, payload) => {
                        try {
                          await payments.addPaypal(payload.nonce, payload.details.email)
                          notificationStore.show('Paypal successfully added.')
                          this.onsuccess.emit()
                        } catch (error) {
                          this.error = error
                        }
                      })
                    },

                    onCancel: function (data) {
                      console.log('PayPal payment canceled.')
                    },

                    onError: function (err) { }
                  })
                  .render('#paypal-button')
                  .catch(err => { })
              }
            )
          }
        )
      }
    )
  }
}
