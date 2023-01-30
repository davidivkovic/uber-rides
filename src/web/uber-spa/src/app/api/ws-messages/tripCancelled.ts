import { CurrencyPipe } from '@angular/common'
import { Component } from '@angular/core'
import { dialogStore, ridesStore } from '@app/stores'
import { Dialog } from '@app/components/ui/dialog'
import { removeAllElements } from '../google-maps'

export default async (message: {
  tripId: number
  reason: string
  refundAmount: number
}) => {
  dialogStore.openDialog(TripCancelledDialog, message, () => {
    ridesStore.setState(store => {
      store.data = {}
    })
    removeAllElements()
    ridesStore.pages?.lookingPage?.cleanUp?.()
    ridesStore.pages?.chooseRidesPage?.cleanUp?.()
    window.router.navigate(['/looking'])
    window.detector.detectChanges()
  })
}

@Component({
  selector: 'TripCancelledDialog',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="w-[370px] h-[440px] flex flex-col">
      <h3 class="text-2xl tracking-wide">Ride cancelled</h3>
      <p class="text-[15px]">
        We are sorry to inform you that your current ride has been cancelled
      </p>
      <div class="my-auto">
        <p class="text-lg text-center">You will be refunded the full amount of</p> 
        <h3 class="text-2xl text-center">{{ props.refundAmount | currency:'USD' }}</h3>
      </div>
      <p class="text-sm text-neutral-600 text-center">
        The driver has cited <span class="italic">"{{ props.reason }}"</span> as the reason for the cancellation
      </p>
      <button (click)="close()" class="primary w-full mt-4">Continue</button>
    </div>
  `
})
class TripCancelledDialog extends Dialog {

}