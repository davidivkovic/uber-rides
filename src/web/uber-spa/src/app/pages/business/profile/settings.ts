import { Component } from '@angular/core'

@Component({
  standalone: true,
  template: `<div class="w-full space-y-8 pr-52">
    <div class="flex space-x-3 items-center">
      <label for="files">
        <img
          class="h-14 w-14 rounded-full cursor-pointer bg-zinc-100 object-cover"
          [src]="img"
        />
      </label>
      <div>
        <div class="text-xl">Milica Draca</div>
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
              Change profile image
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
        <input type="text" />
      </div>
      <div class="flex space-x-3 items-center">
        <p class="w-40">Last name</p>
        <input type="text" />
      </div>
    </div>
    <div class="space-y-5">
      <div class="">
        <h2 class="text-xl">Additional information</h2>
        <p class="text-gray-500 text-sm">Update your additional information</p>
      </div>
      <div class="flex space-x-3 items-center">
        <p class="w-40">City</p>
        <input type="text" />
      </div>
      <div class="flex space-x-3 items-center">
        <p class="w-40">Phone number</p>
        <input type="tel" />
      </div>
    </div>
    <button class="primary float-right">Save changes</button>
  </div>`
})
export class Settings {
  img: string | ArrayBuffer =
    'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'

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
}
