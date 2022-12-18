import { Component, EventEmitter, Output } from '@angular/core'
import { watchEffect } from '@app/utils'
import payments from '@app/api/payments'
import { notificationStore } from '@app/stores'

declare const braintree
declare const paypal

@Component({
  selector: 'Paypal',
  standalone: true,
  template: `
    <div class="h-full flex flex-col justify-between">
      <div>
        {{ scriptsLoaded() }}
        <h1 class="text-2xl ">Add PayPal</h1>
        <p class="mt-5">You will be re-directed to PayPal to verify your account.</p>
      </div>
      <div class="flex flex-col justify-end mt-20 space-y-2">
        <p class="text-red-600 text-center text-sm">{{ error }}</p>
        <div id="paypal-button"></div>
      </div>
    </div>
  `
})
export default class Pay {
  braintreeLoaded = false
  paypalLoaded = false

  error = ''
  token = ''

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

  initPaypal = () => {
    braintree.client.create(
      {
        authorization: this.token,
        vault: true
      },
      (clientErr, clientInstance) => {
        if (clientErr) {
          console.error('Error creating client:', clientErr)
          return
        }
        braintree.paypalCheckout.create(
          {
            autoSetDataUserIdToken: true,
            client: clientInstance
          },
          (paypalCheckoutErr, paypalCheckoutInstance) => {
            paypalCheckoutInstance.loadPayPalSDK(
              {
                currency: 'USD',
                intent: 'capture'
              },
              () => {
                paypal
                  .Buttons({
                    style: {
                      color: 'black',
                      label: 'paypal'
                    },
                    fundingSource: paypal.FUNDING.PAYPAL,

                    createOrder() {
                      return paypalCheckoutInstance.createPayment({
                        flow: 'checkout',
                        amount: 20,
                        currency: 'USD',
                        intent: 'capture',
                        requestBillingAgreement: true
                      })
                    },

                    onApprove: (data, actions) => {
                      return paypalCheckoutInstance.tokenizePayment(data, async (err, payload) => {
                        await payments.pay({nonce: payload.nonce, amount: 10, email: payload.details.email})
                      })
                    },

                    onCancel: function (data) {
                      console.log('PayPal payment canceled.')
                    },

                    onError: function (err) {
                      console.error('PayPal error', err)
                    }
                  })
                  .render('#paypal-button')
              }
            )
          }
        )
      }
    )
  }
}
