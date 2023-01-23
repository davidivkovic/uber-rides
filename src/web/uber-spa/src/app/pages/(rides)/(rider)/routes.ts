import { Routes } from '@angular/router'
import { userStore, ridesStore } from '@app/stores'

const isAuthenticated = () => {
  if (userStore.isAuthenticated) return true
  window.router.navigate(['/404'])
  window.detector.detectChanges()
  return false
}

const routes: Routes = [
  {
    path: '',
    data: { reuseRoute: true },
    loadComponent: () => import('./index'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [() => {
          if (ridesStore.data.pickup || ridesStore.data.tripInProgress) {
            window.router.navigate(['/passengers'])
          }
          else if (location.pathname === '/looking/choose-ride') {
            // ridesStore.setState(store => store.data = {})
            window.router.navigate(['/looking'])
          }
          else if (ridesStore.data.directions && ridesStore.data.choosingRide) {
            window.router.navigate(['/looking/choose-ride'])
          }
          else window.router.navigate(['/looking'])
          return true
        }],
        loadChildren: () => []
      },
      {
        path: 'looking',
        children: [
          {
            path: '',
            data: { reuseRoute: true },
            loadComponent: () => import('./looking')
          },
          {
            path: 'favorite-routes',
            data: { reuseRoute: true },
            canActivate: [isAuthenticated],
            loadComponent: () => import('./favorite-routes')
          },
          {
            path: 'choose-time',
            data: { reuseRoute: true },
            loadComponent: () => import('./choose-time')
          },
          {
            path: 'pick-location',
            data: { reuseRoute: true },
            loadComponent: () => import('./pick-location')
          },
          {
            path: 'add-passengers',
            data: { reuseRoute: true },
            canActivate: [isAuthenticated],
            loadComponent: () => import('./add-passengers')
          },
          {
            path: 'choose-ride',
            data: { reuseRoute: true },
            loadComponent: () => import('./choose-ride')
          },
        ]
      },
      {
        path: 'passengers',
        data: { reuseRoute: true },
        canActivate: [isAuthenticated],
        loadComponent: () => import('./passengers')
      }
    ]
  }
]

export default routes