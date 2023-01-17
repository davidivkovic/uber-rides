import { Routes } from '@angular/router'
import Layout from './layout'

const routes: Routes = [
  {
    path: '',
    data: { reuseRoute: true },
    loadComponent: () => import('./index')
  },
  {
    path: 'dashboard',
    component: Layout,
    children: [
      {
        path: 'settings',
        loadComponent: () => import('../(business)/profile/settings')
      },
      {
        path: 'password/change',
        loadComponent: () => import('../(business)/profile/changePassword')
      },
      {
        path: 'update-requests',
        loadComponent: () => import('./update-requests')
      },
      {
        path: 'drivers',
        children: [
          {
            path: '',
            loadComponent: () => import('./drivers')
          },
          {
            path: ':id/rides',
            loadComponent: () => import('./drivers/rides')
          }
        ]
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