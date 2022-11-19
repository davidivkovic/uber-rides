import { Routes } from '@angular/router'
import Index from './index'
import auth from './auth/routes'
import business from './business/routes'
import HeaderLayout from './layout'

const routes: Routes = [

  {
    path: '',
    component: HeaderLayout,
    children: [{ path: '', component: Index }, ...auth, ...business]
  }
]

export default routes
