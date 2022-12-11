import { Component } from '@angular/core'
import { NgIf } from '@angular/common'

@Component({
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="w-[400px] h-[700px] flex flex-col p-4 bg-white rounded-xl pointer-events-auto">
      <h3 class="text-4xl pb-2">Riding</h3>
    </div>
  `
})
export default class Riding {

}