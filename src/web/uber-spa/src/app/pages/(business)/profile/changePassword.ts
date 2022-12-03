import { Component } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import { NgIf } from '@angular/common'
import { notificationStore } from '@app/stores'
import { resource } from '@app/utils'
import users from '@app/api/users'
import auth from '@app/api/auth'

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <form
      #form="ngForm"
      ngNativeValidate
      (ngSubmit)="changePassword(form)"
      class="max-w-md space-y-5"
      *ngIf="!user.loading || user?.value"
    >
      <div class="flex space-x-3 items-center">
        <img
          [src]="user.value.profilePicture"
          class="h-16 w-16 rounded-full bg-zinc-100 object-cover"
        />
        <div>
          <h3 class="text-2xl">{{ user.value?.firstName }} {{ user.value?.lastName }}</h3>
        </div>
      </div>
      <div>
        <h2 class="text-xl">Change password</h2>
        <p class="text-gray-500 text-sm">
          Create a new password and use it for login next time
        </p>
      </div>
      <div class="flex space-x-3 items-center">
        <p class="w-40">Old password</p>
        <input required ngModel #currentPassword="ngModel" name="currentPassword" type="password" />
      </div>
      <div class="flex space-x-3 items-center">
        <p class="w-40">New password</p>
        <input ngModel #newPassword="ngModel" required name="newPassword" type="password" />
      </div>
      <p class="text-red-600 text-center text-sm">{{ error }}</p>
      <div class="flex justify-end space-x-3">
        <button class="primary float-right">Change password</button>
      </div>
    </form>
  `
})
export default class ChangePassword {
  user = resource(users.getProfile)
  error = ''

  changePassword = async (form: NgForm) => {
    try {
      this.error = ''
      await auth.changePassword(form.value)
      notificationStore.show('Your password has been successfully changed.')
    } catch (error) {
      this.error = error.message
    }
  }
}
