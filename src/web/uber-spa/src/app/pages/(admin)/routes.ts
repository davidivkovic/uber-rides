import { Routes } from '@angular/router'
import Layout from './layout'

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'update-requests',
        loadComponent: () => import('./update-requests')
      },
      {
        path: 'drivers',
        loadComponent: () => import('./drivers')
      },
      {
        path: 'riders',
        children: [
          {
            path: '',
            loadComponent: () => import('./riders')
          },
          {
            path: ':id/rides',
            loadComponent: () => import('./riders/rides')
          }
        ]
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics')
      },
    ]
  }
]

export default routes