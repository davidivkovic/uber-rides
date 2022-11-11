import { Routes } from '@angular/router'
import Index from './index'
import tickets from './tickets/routes'
import users from './users/routes'
import previews from './previews/routes'

const routes: Routes = [
  { path: '', component: Index },
  ...tickets,
  ...users,
  ...previews

]

export default routes