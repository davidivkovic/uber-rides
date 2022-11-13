import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'signup',
    children: [
      {
        path: 'ride',
        loadComponent: () => import('./ride').then((m) => m.Index),
      },
      {
        path: 'drive',
        loadComponent: () => import('./drive').then((m) => m.Index),
      },
    ],
  },
];

export default routes;
