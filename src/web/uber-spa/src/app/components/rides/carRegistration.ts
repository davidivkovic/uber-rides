import { Component, Input } from '@angular/core'
import { computed } from '@app/utils'

@Component({
  selector: 'CarRegistration',
  standalone: true,
  template: `
    <div class="inline-block relative">
      <h3 class="text-[13.5px] tracking-wide px-3 pl-11 py-1.5 rounded-full border">
        {{ registration() }}
      </h3>
      <img [src]="car?.type?.image" class="absolute h-10 w-10 object-cover left-1 -top-[5px]"/>
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