import { Routes } from '@angular/router';
import Index from './index';
import tickets from './tickets/routes';
import users from './users/routes';
import previews from './previews/routes';
import login from './login/routes';

const routes: Routes = [
  { path: '', component: Index },
  ...tickets,
  ...users,
  ...previews,
  ...login,
];

export default routes;
