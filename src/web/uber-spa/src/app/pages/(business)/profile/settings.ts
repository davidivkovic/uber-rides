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
      (ngSubmit)="updateUser()"
      *ngIf="!user.loading || user?.value"
      class="w-full space-y-8 max-w-md"
    >
      <div class="flex space-x-3 items-center">
        <label for="files">
          <img
            [src]="user.value.profilePicture" alt=""
            class="h-16 w-16 rounded-full cursor-pointer bg-zinc-100 object-cover"
          />
        </label>
        <div>
          <h3 class="text-2xl">{{ user.value?.firstName }} {{ user.value?.lastName }}</h3>
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
        <div>
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
      <p class="text-red-600 text-center text-sm">{{ error }}</p>
      <div class="flex justify-end space-x-3">
        <button *ngIf="form.dirty" (click)="cancel(form)" type="button" class="secondary">Cancel</button>
        <button class="primary float-right">Save changes</button>
      </div>
    </form>
  `
})
export default class Settings {

  image: File
  error = ''
  user = resource(users.getProfile)

  changeProfileImage = (fileEvent: Event) => {
    const reader = new FileReader()

    reader.onload = e => {
      this.user?.value && (this.user.value.profilePicture = e.target.result)
    }

    this.image = (fileEvent.target as HTMLInputElement).files[0]
    reader.readAsDataURL(this.image)
  }

  updateUser = async () => {
    try {
      this.error = ''
      await users.update(
        {
          firstName: this.user?.value?.firstName,
          lastName: this.user?.value?.lastName,
          city: this.user?.value?.city,
          phoneNumber: this.user?.value?.phoneNumber
        },
        this.image
      )
      notificationStore.show('Your profile has successfully been updated.')
    }
    catch (error) {
      this.error = error.message
    }
  }

  cancel = (form: NgForm) => {
    form.form.markAsPristine()
    this.user.refetch()
  }
}
