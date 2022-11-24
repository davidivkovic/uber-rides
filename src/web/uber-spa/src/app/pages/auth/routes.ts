import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login').then(m => m.Index)
      },
      {
        path: 'signup',
        children: [
          {
            path: '',
            loadComponent: () => import('./signup/ride').then(m => m.Index)
          },
          {
            path: ':email',
            loadComponent: () => import('./signup/[email]').then(m => m.EmailVerification)
          },
          {
            path: 'drive',
            loadComponent: () => import('./signup/drive').then(m => m.Index)
          }
        ]
      }
    ]
  }
]

export default routes
