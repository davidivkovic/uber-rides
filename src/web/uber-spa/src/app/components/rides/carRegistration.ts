import { NgClass } from '@angular/common'
import { Component, Input } from '@angular/core'
import { computed } from '@app/utils'

@Component({
  selector: 'CarRegistration',
  imports: [NgClass],
  standalone: true,
  template: `
    <div 
      class="inline-block relative cursor-default" 
      [title]="car?.registration + ' (' + car?.type?.name + ')'"
    >
      <h3 class="text-[13.5px] tracking-wide px-3 pl-11 py-1 rounded-full border pointer-events-none">
        {{ registration() }}
      </h3>
      <img 
        [src]="car?.type?.image" 
        [ngClass]="{
          '-top-[5px]': !car?.type?.image?.includes('Green'), 
          '-top-[3px]': car?.type?.image?.includes('Green')
        }"
        class="absolute h-9 w-9 object-cover left-1 pointer-events-none"
      />
    </div>
  `
})
export default class CarRegistration {
  @Input() car: any
  registration = computed(
    () => this.car?.registration,
    () => this.car?.registration?.replace('-', ' • ')
  )
}