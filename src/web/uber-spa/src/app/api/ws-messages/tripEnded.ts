import { removeAllElements } from '../google-maps'
import { dialogStore, ridesStore, userStore } from '@app/stores'
import { Dialog } from '@app/components/ui/dialog'
import { Component } from '@angular/core'

export default (message: {}) => {
  dialogStore.openDialog(TripEndedDialog, {}, () => {
    removeAllElements()
    ridesStore.setState(store => {
      store.data = {}
      store.locationPicked = null
      store.favoriteRoutePicked = null
      store.setMapElements()
    })
    if (userStore.user.role === 'ROLE_DRIVER') {
      window.router.navigate(['/roam'])
    }
    else {
      window.router.navigate(['/looking'])
      ridesStore.pages?.lookingPage?.cleanUp?.()
    }
    window.detector.detectChanges()
  })
}

@Component({
  selector: 'TripEndedDialog',
  standalone: true,
  template: `
    <div class="bg-white w-[360px] pointer-events-auto space-y-2 max-w-md">
      <h1>Trip ended...</h1>
    </div>
  `
})
export class TripEndedDialog extends Dialog {

}