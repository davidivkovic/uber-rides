import { Routes } from '@angular/router'
import Index from './index'
import login from './login/routes'
import signup from './signup/routes'
import MainLayout from '../layouts/main-layout/mainLayout'
import HeaderLayout from '../layouts/header-layout/headerLayout'

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Index
      }
    ]
  },

  {
    path: '',
    component: HeaderLayout,
    children: [...login, ...signup]
  }
]

export default routes
