import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'live-support',
    loadComponent: () => import('./support')
  },
  {
    path: 'chat',
    loadComponent: () => import('./index')
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./index')
  }
]

export default routes
