import { Routes } from '@angular/router'
import Layout from './layout'

const routes: Routes = [
  {
    path: 'profile',
    component: Layout,
    children: [
      {
        path: 'settings', loadComponent: () => import('./settings')
      },
      {
        path: 'rides', loadComponent: () => import('./rides')
      },
      {
        path: 'password/change', loadComponent: () => import('./changePassword')
      }
    ]
  }
]

export default routes