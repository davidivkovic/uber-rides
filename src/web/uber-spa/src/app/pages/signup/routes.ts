import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'signup',
    children: [
      {
        path: '',
        loadComponent: () => import('./ride').then((m) => m.Index),
      },
      {
        path: 'verification-code/:email',
        loadComponent: () =>
          import('./[email]').then((m) => m.EmailVerification),
      },
      {
        path: 'drive',
        loadComponent: () => import('./drive').then((m) => m.Index),
      },
    ],
  },
];

export default routes;
