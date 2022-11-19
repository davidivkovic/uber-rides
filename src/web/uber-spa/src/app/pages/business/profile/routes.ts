import { Routes } from "@angular/router";
import Layout from "./layout";

const routes: Routes = [
    {
      path: 'profile',
      component: Layout,
      children: [
        {
            path: 'settings', loadComponent: () => import('./settings').then(m => m.Settings)
        },
        {
            path: 'rides', loadComponent: () => import('./rides').then(m => m.Rides)
        }
      ]
    }
  ]

export default routes