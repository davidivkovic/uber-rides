import { Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./index'),
    children: [
      {
        path: 'looking',
        children: [
          {
            path: '',
            data: { reuseRoute: true },
            loadComponent: () => import('./looking')
          },
          {
            path: 'favorite-routes',
            data: { reuseRoute: true },
            loadComponent: () => import('./favorite-routes')
          },
          {
            path: 'choose-time',
            data: { reuseRoute: true },
            loadComponent: () => import('./choose-time')
          },
          {
            path: 'pick-location',
            loadComponent: () => import('./pick-location')
          }
        ]
      },
      {
        path: 'add-passengers',
        data: { reuseRoute: true },
        loadComponent: () => import('./add-passengers')
      },
    ]
  }
]

export default routes