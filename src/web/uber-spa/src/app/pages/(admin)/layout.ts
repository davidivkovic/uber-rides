import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import Footer from '@app/components/common/footer'
import AdminSidebar from './components/adminSidebar'

@Component({
  standalone: true,
  imports: [RouterOutlet, Footer, AdminSidebar],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex w-[1265px] h-full mx-auto pt-10">
        <AdminSidebar class="pr-10"></AdminSidebar>
        <router-outlet></router-outlet>
      </div>
      <Footer></Footer>
    </div>
  `
})
export default class Layout { }
