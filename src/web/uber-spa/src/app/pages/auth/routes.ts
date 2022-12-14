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
        path: 'password/forgotten',
        loadComponent: () => import('./forgottenPassword')
      },
      {
        path: ':email/reset',
        loadComponent: () => import('./resetPassword')
      },
      {
        path: 'signup',
        children: [
          {
            path: '',
            loadComponent: () => import('./signup/signup')
          },
          {
            path: 'drive',
            loadComponent: () => import('./signup/signup'),
          },
          {
            path: ':driverId/car',
            loadComponent: () => import('./signup/drive'),
          },
          {
            path: ':email',
            loadComponent: () => import('./signup/[email]')
          }
        ]
      }
    ]
  }
]

export default routes
