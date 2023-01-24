import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import trips from '@app/api/trips'
import { Dialog } from '@app/components/ui/dialog'

@Component({
  selector: 'CancelTripDialog',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="w-[370px] h-[460px] flex flex-col">
      <h3 class="text-2xl tracking-wide">Cancel ride</h3>
      <p class="text-[15px]">
        You are about to cancel your currently assigned ride.
        Please select a reason for the cancellation so we can notify the passengers.
      </p>
      <h3 class="tracking-wide text-sm mt-4 mb-0.5">Reason</h3>
      <select 
        [(ngModel)]="reason" 
        class="cursor-pointer text-[15px]"
      >
        <option>The passenger did not show up</option>
        <option>I am facing a traffic jam</option>
        <option>I am having problems with my car</option>
        <option>I am experiencing health problems</option>
        <option>Other (please describe)</option>
      </select>
      <textarea 
        *ngIf="reason.startsWith('Other')"
        [(ngModel)]="otherReason"
        class="h-[140px] mt-2.5 resize-none text-[15px]" 
        maxlength="220"
        spellcheck="false"
        placeholder="Describe the reason for the cancellation"
      ></textarea>
      <button 
        (click)="confirm()"
        [disabled]="reason.startsWith('Other') && otherReason.trim().length === 0"
        class="primary w-full mt-auto"
      >
        Cancel Ride
      </button>
      <button (click)="close()" class="secondary w-full mt-1">Go Back</button>
    </div>
  `
})
export default class CancelTripDialog extends Dialog {
  reason: string = 'The passenger did not show up'
  otherReason: string = ''

  async confirm() {
    try {
      await trips.cancelTrip(this.reason.startsWith('Other') ? this.otherReason : this.reason)
      this.close('ok')
    }
    catch (error) {
      console.error(error.message)
    }
  }

}