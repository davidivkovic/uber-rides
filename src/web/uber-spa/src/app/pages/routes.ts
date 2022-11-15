import { Routes } from '@angular/router'
import Index from './index'
import auth from './auth/routes'
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
    children: [...auth]
  }
]

export default routes
