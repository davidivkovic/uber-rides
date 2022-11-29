import { Component, EventEmitter, Input, Output } from '@angular/core'
import { computed } from '@app/utils'

@Component({
  selector: 'LocationPicker',
  standalone: true,
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-[28px] leading-[34px]">{{ title() }}</h3>
        <p class="text-lg pt-0.5 pb-2 text-zinc-700">{{ location }}</p>
        <button (click)="confirm.emit()" class="primary w-full !text-base">{{ confirmationText() }}</button>
        <button (click)="cancel.emit()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class LocationPicker {
  @Input() location: string = '{Location Address}'
  @Input() type: 'pickup' | 'stopover' | 'destination' | any
  @Output() confirm = new EventEmitter()
  @Output() cancel = new EventEmitter()

  title = computed(
    () => this.type,
    () => ({
      'pickup': 'Choose pickup location',
      'destination': 'Choose destination location',
      'stopover': 'Choose location to stop at'
    })[this.type] ?? 'Choose location'
  )

  confirmationText = computed(
    () => this.type,
    () => ({
      'pickup': 'Confirm pickup',
      'stopover': 'Confirm stop',
      'destination': 'Confirm destination'
    })[this.type] ?? 'Confirm location'
  )
}