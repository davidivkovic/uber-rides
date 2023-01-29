import { removeAllElements } from '../google-maps'
import { dialogStore, ridesStore, userStore } from '@app/stores'
import { Dialog } from '@app/components/ui/dialog'
import { Component } from '@angular/core'
import ReviewDriverDialog from '@app/components/common/reviewDriverDialog'

export default (message: {}) => {
  removeAllElements()
  ridesStore.setMapElements()
  if (userStore.isDriver) {
    dialogStore.openDialog(TripEndedDialog, {}, () => {
      ridesStore.setState(store => {
        store.data = {}
      })
      window.router.navigate(['/roam'])
    })
  }
  else {
    dialogStore.openDialog(
      ReviewDriverDialog,
      { tripJustEnded: true, trip: ridesStore.data.trip },
      () => {
        ridesStore.setState(store => {
          store.data = {}
          store.locationPicked = null
          store.favoriteRoutePicked = null
        })
        ridesStore.pages?.lookingPage?.cleanUp?.()
        window.router.navigate(['/looking'])
      })
  }
  window.detector.detectChanges()

}

@Component({
  selector: 'TripEndedDialog',
  standalone: true,
  template: `
    <div class="bg-white w-[360px] h-[440px] pointer-events-auto max-w-md flex flex-col">
      <h3 class="text-2xl">Ride finished</h3>
      <p class="">You can now continue to look for new rides</p>
      <button (click)="close()" class="primary mt-auto">Continue</button>
    </div>
  `
})
export class TripEndedDialog extends Dialog {

}