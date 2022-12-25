import { Routes, UrlSegment } from '@angular/router'
import { userStore } from '@app/stores'

const routes: Routes = [
  {
    matcher: () => {
      if (userStore.isDriver) return { consumed: [] }
      return null
    },
    loadChildren: () => import('./(driver)/routes')
  },
  {
    matcher: () => {
      if (userStore.isRider) return { consumed: [] }
      return null
    },
    loadChildren: () => import('./(rider)/routes')
  }
]

export default routes