import { Routes, UrlSegment } from '@angular/router'
import { userStore } from '@app/stores'

const routes: Routes = [
  {
    path: ':path',
    children: [
      {
        matcher: () => {
          if (!userStore.isDriver) return null
          return { consumed: [] }
        },
        loadComponent: () => import('./(driver)')
      },
      {
        matcher: (segments: UrlSegment[]) => {
          if (!userStore.isRider) return null
          const paths = ['looking', 'add-passengers', 'choose-ride']
          const index = paths.indexOf(segments[0]?.path)
          if (index === -1) return { consumed: [] }
          return { consumed: [segments[0]] }
        },
        loadComponent: () => import('./(rider)'),
        data: { reuseRoute: true }
      }]
  }
]

export default routes