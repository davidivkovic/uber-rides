import { NgFor, NgIf } from '@angular/common'
import { Component } from '@angular/core'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import users from '@app/api/users'

dayjs.extend(relativeTime)

@Component({
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="px-1">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-3xl text-gray-900">Update Requests</h1>
          <p class="mt-1 text-gray-500">Approve or reject a driver's profile update request</p>
        </div>
      </div>
      <div *ngIf="updateRequests.length" class="mt-3 flex flex-col">
        <div class="-my-2 overflow-x-auto">
          <div class="inline-block min-w-full py-2 align-middle">
            <div class="overflow-hidden rounded-lg">
              <table class="min-w-full divide-y bg-[#f1f1f1]">
                <thead class="bg-[#f1f1f1]">
                  <tr>
                    <th scope="col" class="py-3 pl-4 text-left text-[13px] tracking-wide text-gray-500 sm:pl-6">
                      Image
                    </th>
                    <th scope="col" class="pr-3 py-3 text-left text-[13px] tracking-wide text-gray-500 sm:pl-6">
                      First Name
                    </th>
                    <th scope="col" class="px-3 py-3 text-left text-[13px] tracking-wide text-gray-500">
                      Last Name
                    </th>
                    <th scope="col" class="px-3 py-3 text-left text-[13px] tracking-wide text-gray-500">
                      Phone
                    </th>
                    <th scope="col" class="px-3 py-3 text-left text-[13px] tracking-wide text-gray-500">
                      City
                    </th>
                    <th scope="col" class="px-3 py-3 text-left text-[13px] tracking-wide text-gray-500">
                      Requested
                    </th>
                    <th scope="col" class="py-3 pr-10 text-right text-[13px] tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let request of updateRequests">
                    <td class="pl-6"><img [src]="request.profilePicture" class="rounded-full object-cover h-9 w-9" /></td>
                    <td class="whitespace-nowrap pr-3 text-sm text-gray-900 sm:pl-6">{{ request.firstName }}</td>
                    <td class="whitespace-nowrap px-3 text-sm text-gray-500">{{ request.lastName }}</td>
                    <td class="whitespace-nowrap px-3 text-sm text-gray-500">{{ request.phoneNumber }}</td>
                    <td class="whitespace-nowrap px-3 text-sm text-gray-500">{{ request.city }}</td>
                    <td class="whitespace-nowrap px-3 text-sm text-gray-500">{{ dayjs(request.requestedAt).fromNow() }}</td>
                    <td class="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm sm:pr-6">
                      <button 
                        (click)="resolveUpdateRequest(request.id, 'REJECT')"
                        class="hover:bg-gray-200 py-2 px-4 mr-1 text-sm"
                      >
                        Reject
                        <span class="sr-only">, {{ request.email }}</span>
                      </button>
                      <button 
                        (click)="resolveUpdateRequest(request.id, 'ACCEPT')"
                        class="hover:bg-black hover:text-white py-2 px-3.5 text-sm"
                      >
                        Approve 
                        <span class="sr-only">, {{ request.email }}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="!updateRequests.length" class="mt-7 flex flex-col">
        <p class="text-gray-600">No update requests at this time.</p>
      </div>
    </div>
  `
})
export default class UpdateRequests {

  dayjs = dayjs
  updateRequests = []

  constructor() {
    this.getUpdateRequests()
  }

  async getUpdateRequests() {
    this.updateRequests = await users.getUpdateRequests()
  }

  async resolveUpdateRequest(id: string, action: 'ACCEPT' | 'REJECT') {
    try {
      await users.resolveUpdateRequest(id, action)
      this.updateRequests = this.updateRequests.filter(request => request.id !== id)
    }
    catch (error) {
      console.log(error)
    }
  }

}