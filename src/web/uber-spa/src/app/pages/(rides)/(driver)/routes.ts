import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    data: { reuseRoute: true },
    loadComponent: () => import('./index'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'roam'
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