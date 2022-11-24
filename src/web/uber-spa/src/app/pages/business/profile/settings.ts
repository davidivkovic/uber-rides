import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import users from '@app/api/users'
import { notificationStore } from '@app/stores'
import { resource } from '@app/utils'

@Component({
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <form 
      ngNativeValidate
      #form="ngForm"
      (ngSubmit)="updateUser(form)"
      *ngIf="!user.loading || user?.value"
      class="w-full space-y-8 max-w-md"
    >
      <div class="flex space-x-3 items-center">
        <label for="files">
          <img
            class="h-16 w-16 rounded-full cursor-pointer bg-zinc-100 object-cover"
            [src]="img"
          />
        </label>
        <div>
          <div class="text-xl">{{ user.value?.firstName }} {{ user.value?.lastName }}</div>
          <div>
            <input
              type="file"
              id="files"
              name="files"
              accept="image/png, image/jpeg, image/jpg"
              class="hidden"
              (change)="changeProfileImage($event)"
            />
            <label for="files">
              <div class="text-sm underline cursor-pointer">
                Change profile picture
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="space-y-5">
        <div class="">
          <h2 class="text-xl">Personal information</h2>
          <p class="text-gray-500 text-sm">Update your personal information</p>
        </div>
        <div class="flex space-x-3 items-center">
          <p class="w-40">First name</p>
          <input 
            required
            name="firstName"
            type="text" 
            [(ngModel)]="user.value.firstName"
          />
        </div>
        <div class="flex space-x-3 items-center">
          <p class="w-40">Last name</p>
          <input 
            required
            type="text"
            name="lastName"
            [(ngModel)]="user.value.lastName"
          />
        </div>
      </div>
      <div class="space-y-5">
        <div class="">
          <h2 class="text-xl">Additional information</h2>
          <p class="text-gray-500 text-sm">Update your additional information</p>
        </div>
        <div class="flex space-x-3 items-center">
          <p class="w-40">City</p>
          <input 
            required
            type="text"
            name="city"
            [(ngModel)]="user.value.city"
          />
        </div>
        <div class="flex space-x-3 items-center">
          <p class="w-40">Phone number</p>
          <input 
            required
            type="tel"
            [minLength]="10"
            name="phoneNumber"
            [(ngModel)]="user.value.phoneNumber"
          />
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button *ngIf="form.dirty" (click)="cancel(form)" type="button" class="secondary">Cancel</button>
        <button class="primary float-right">Save changes</button>
      </div>
    </form>
  `
})
export class Settings {

  img: string | ArrayBuffer = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
  user = resource(users.getProfile)

  changeProfileImage = (fileEvent: Event) => {
    console.log('img')
    const reader = new FileReader()

    reader.onload = e => {
      this.img = e.target.result
    }

    const file = (fileEvent.target as HTMLInputElement).files[0]
    reader.readAsDataURL(file)

    console.log(this.img)
    console.log(file)
  }

  updateUser = (from: NgForm) => {
    notificationStore.show('Your profile has been successfully updated.')
  }

  cancel = (form: NgForm) => {
    form.form.markAsPristine()
    this.user.refetch()
  }
}
