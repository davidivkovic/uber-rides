import { Routes, UrlSegment } from '@angular/router'
import { userStore } from '@app/stores'

const routes: Routes = [
  {
    matcher: () => {
      if (userStore.isDriver) return { consumed: [] }
      return null
    },
    loadComponent: () => import('./(driver)')
  },
  {
    matcher: () => {
      if (userStore.isRider) return { consumed: [] }
      return null
    },
    loadComponent: () => import('./(rider)')
  }
]

export default routes