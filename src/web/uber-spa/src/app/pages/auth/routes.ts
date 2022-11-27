import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login')
      },
      {
        path: 'signup',
        children: [
          {
            path: '',
            loadComponent: () => import('./signup/ride')
          },
          {
            path: ':email',
            loadComponent: () => import('./signup/[email]')
          },
          {
            path: 'drive',
            loadComponent: () => import('./signup/drive')
          }
        ]
      }
    ]
  }
]

export default routes
