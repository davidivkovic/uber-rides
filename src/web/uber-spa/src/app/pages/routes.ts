import { Routes, UrlSegment } from '@angular/router'
import Layout from './layout'
import Index from './index'
import auth from './auth/routes'
import { userStore } from '@app/stores'

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      // Unauthenticated users on root path
      {
        matcher: () => {
          if (!userStore.isAuthenticated) return { consumed: [] }
          return null
        },
        children: [{ path: '', component: Index }]
      },
      // Authenticated non-admin users on root path as defined by ./(rides)/routes  mixed with ./(business)/routes
      {
        matcher: () => {
          if (userStore.isDriver || userStore.isRider) return { consumed: [] }
          return null
        },
        loadChildren: async () => [
          ... await import('./(rides)/routes').then(m => m.default),
          ... await import('./(business)/routes').then(m => m.default)
        ] as Routes
      },
      ...auth,
      {
        path: '**',
        loadComponent: () => import('./404')
      }
    ]
  }
]

export default routes