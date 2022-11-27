import { Routes } from '@angular/router'
import Layout from "./layout"
import profile from './profile/routes'

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      ...profile
    ]
  }
]

export default routes