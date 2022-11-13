import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tickets',
    children: [
      { path: '', loadComponent: () => import('./index').then((m) => m.Index) },
      { path: ':id', loadComponent: () => import('./[id]').then((m) => m.Id) },
    ],
  },
];

export default routes;
