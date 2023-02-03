import { NgClass, NgFor } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { dialogStore } from '@app/stores'
import Dropdown from '@app/components/ui/base/dropdown'
import users from '@app/api/users'
import { PFP } from '@app/utils'

@Component({
  standalone: true,
  imports: [FormsModule, NgFor, NgClass, Dropdown, PFP],
  template: `
    <div class="px-1">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-3xl text-gray-900">Drivers</h1>
          <p class="mt-1 text-gray-500">Search for drivers, view their rides or block them</p>
        </div>
      </div>
      <input 
        type="text"
        placeholder="Search by name, email or phone"
        autocomplete="off"
        spellcheck="false"
        class="w-64 mt-3"
        [(ngModel)]="query" 
        (input)="getDrivers()"
      />
      <div class="mt-3 flex flex-col">
        <div class="-my-2">
          <div class="inline-block min-w-full py-2 align-middle">
            <table class="min-w-full divide-y bg-[#f1f1f1] rounded-lg">
              <thead>
                <tr>
                  <th scope="col" class="py-3 pl-4 text-left text-sm tracking-wide sm:pl-6">
                    <h3>Image</h3>
                  </th>
                  <th scope="col" class="pr-3 py-3 text-left text-sm tracking-wide sm:pl-6">
                    <h3>First Name</h3>
                  </th>
                  <th scope="col" class="px-3 py-3 text-left text-sm tracking-wide">
                    <h3>Last Name</h3>
                  </th>
                  <th scope="col" class="px-3 py-3 text-left text-sm tracking-wide">
                    <h3>Email</h3>
                  </th>
                  <th scope="col" class="px-3 py-3 text-left text-sm tracking-wide">
                    <h3>Phone</h3>
                  </th>
                  <th scope="col" class="px-3 py-3 text-left text-sm tracking-wide">
                    <h3>City</h3>
                  </th>
                  <th scope="col" class="px-3 py-3 text-left text-sm tracking-wide">
                    <h3>Online</h3>
                  </th>
                  <th scope="col" class="py-3 pr-10 text-right text-sm tracking-wide">
                    <h3>Actions</h3>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let driver of drivers; index as index">
                  <td class="pl-6"><img [src]="driver.profilePicture | PFP" class="rounded-full object-cover h-9 w-9" /></td>
                  <td class="whitespace-nowrap pr-3 text-sm sm:pl-6">{{ driver.firstName }}</td>
                  <td class="whitespace-nowrap px-3 text-sm">{{ driver.lastName }}</td>
                  <td class="whitespace-nowrap px-3 text-sm">{{ driver.email }}</td>
                  <td class="whitespace-nowrap px-3 text-sm">{{ driver.phoneNumber }}</td>
                  <td class="whitespace-nowrap px-3 text-sm">{{ driver.city }}</td>
                  <td class="whitespace-nowrap text-sm">
                    <div 
                      class="w-2 h-2 mx-auto rounded-full"
                      [ngClass]="{ 'bg-green-500': driver.online, 'bg-red-500': !driver.online }"
                    ></div>
                  </td>
                  <td class="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm sm:pr-6">
                    <Dropdown [items]="options[index]"></Dropdown>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export default class Riders {

  query = ''
  criteria = 'ALL'
  drivers = []
  options = []

  constructor() {
    this.getDrivers()
  }

  getOptions(user: any) {
    return [
      {
        label: 'Block Status',
        action: async () => {
          dialogStore.openDialog(
            await import('../components/blockDialog').then(m => m.default),
            { user },
            () => { this.getDrivers() }
          )
        },
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]">
            <path d="M10.5 1.875a1.125 1.125 0 012.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 012.25 0v10.937a4.505 4.505 0 00-3.25 2.373 8.963 8.963 0 014-.935A.75.75 0 0018 15v-2.266a3.368 3.368 0 01.988-2.37 1.125 1.125 0 011.591 1.59 1.118 1.118 0 00-.329.79v3.006h-.005a6 6 0 01-1.752 4.007l-1.736 1.736a6 6 0 01-4.242 1.757H10.5a7.5 7.5 0 01-7.5-7.5V6.375a1.125 1.125 0 012.25 0v5.519c.46-.452.965-.832 1.5-1.141V3.375a1.125 1.125 0 012.25 0v6.526c.495-.1.997-.151 1.5-.151V1.875z" />
          </svg>
        `
      },
      {
        label: 'View Rides',
        url: '/dashboard/riders/' + user.id + '/rides',
        query: { name: user.firstName },
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]">
            <path fill-rule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 01-.375.65 2.249 2.249 0 000 3.898.75.75 0 01.375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625v-3.026a.75.75 0 01.374-.65 2.249 2.249 0 000-3.898.75.75 0 01-.374-.65V6.375zm15-1.125a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zm-.75 3a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0V18a.75.75 0 001.5 0v-.75zM6 12a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H6.75A.75.75 0 016 12zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd" />
          </svg>
        `
      }
    ]
  }

  async getDrivers() {
    this.drivers = await users.getDrivers(0, this.criteria as any, this.query)
    this.options = this.drivers.map(driver => this.getOptions(driver))
  }

}