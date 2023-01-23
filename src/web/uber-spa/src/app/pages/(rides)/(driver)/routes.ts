import { Routes } from '@angular/router'
import { ridesStore } from '@app/stores'

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
          if (ridesStore.data.tripInProgress) window.router.navigate(['/drive'])
          else if (ridesStore.data.pickup) window.router.navigate(['/pickup'])
          else window.router.navigate(['/roam'])
          return true
        }],
        loadChildren: () => []
      },
      {
        path: 'roam',
        data: { reuseRoute: true },
        loadComponent: () => import('./roam')
      },
      {
        path: 'pickup',
        data: { reuseRoute: true },
        loadComponent: () => import('./pickup')
      },
      {
        path: 'drive',
        data: { reuseRoute: true },
        loadComponent: () => import('./drive')
      }
    ]
  }
]

export default routes