import { NgClass, NgFor, NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Dialog } from '@app/components/ui/dialog'
import DriverDetails from '@app/components/common/driverDetails'
import users from '@app/api/users'

@Component({
  selector: 'BlockDialog',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, DriverDetails],
  template: `
    <div *ngIf="!success" class="w-[380px] h-[500px] flex flex-col">
      <h3 class="text-2xl mb-3">Block Status</h3>
      <DriverDetails 
        [driver]="props.user" 
        [large]="true"
        [email]="true"
      >
      </DriverDetails>
      <div class="flex items-center gap-x-1 mt-4 mb-1.5">
        <h3 class="text-[15px]">Block Reason</h3>
        <p class="text-sm text-gray-500">(required)</p>
      </div>
      <textarea 
        [(ngModel)]="blockReason"
        [disabled]="props.user.blocked"
        [ngClass]="{'text-gray-500': blockReason && props.user.blocked}"
        class="h-[180px] resize-none text-sm"
        placeholder="Describe why the user is blocked"
        maxlength="300"
      ></textarea>
      <button 
        [disabled]="!blockReason"
        (click)="changeBlockStatus()" 
        class="block w-full primary mb-1 mt-auto"
      >
        {{ props.user.blocked ? 'Unblock' : 'Block' }}
      </button>
      <button (click)="close()" class="block w-full secondary">
        Finish
      </button>
    </div>
    <div *ngIf="success" class="w-[380px] h-[500px] flex flex-col p-1">
      <h1 class="text-2xl">Success</h1>
      <p class="text-[15px]" *ngIf="!this.props.user.blocked">The user is blocked and will not be able to use Uber services</p>
      <p class="text-[15px]" *ngIf="this.props.user.blocked">The user is unblocked and will be able to use Uber services again</p>
      <button (click)="close()" class="block w-full secondary mt-auto">Finish</button>
    </div>
  `
})
export default class BlockDialog extends Dialog {

  success = false
  blockReason = this.props.user.blockReason

  async changeBlockStatus() {
    try {
      await users.changeBlock(this.props.user.id, !this.props.user.blocked, !this.props.user.blocked ? this.blockReason : '')
      this.success = true
    }
    catch (e) {
      console.error(e.message)
    }
  }

}