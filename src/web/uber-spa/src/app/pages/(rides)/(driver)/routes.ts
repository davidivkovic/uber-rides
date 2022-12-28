import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./index'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'roam'
      },
      {
        path: 'roam',
        loadComponent: () => import('./roam')
      },
      {
        path: 'pickup',
        loadComponent: () => import('./pickup')
      },
      {
        path: 'drive',
        loadComponent: () => import('./drive')
      }
    ]
  }
]

export default routes