import { Component, EventEmitter, Output } from '@angular/core'

@Component({
  selector: 'ChooseTime',
  standalone: true,
  template: `
    <div class="h-[700px]">
      <div class="w-[400px] p-4 bg-white rounded-xl pointer-events-auto">
        <h3 class="text-[28px] leading-[34px] pb-2">Choose a time</h3>
        <button (click)="confirm.emit()" class="primary w-full !text-base">Conirm Route</button>
        <button (click)="cancel.emit()" class="secondary w-full mt-1 !text-base">Cancel</button>
      </div>
    </div>
  `
})
export default class ChooseTime {
  @Output() confirm = new EventEmitter()
  @Output() cancel = new EventEmitter()
}