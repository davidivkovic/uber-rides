import { Routes } from "@angular/router";
import FooterLayout from "./layout";
import profile from './profile/routes'

const routes: Routes = [
    {
      path: '',
      component: FooterLayout,
      children: [
        ...profile
      ]
    }
  ]

  export default routes