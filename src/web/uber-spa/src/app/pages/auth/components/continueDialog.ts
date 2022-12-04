import { Component } from '@angular/core'
import { Dialog } from '@app/components/ui/dialog'
import { CloseButton } from '@app/components/ui/base/closeButton'
import { NgIf } from '@angular/common'

@Component({
    standalone: true,
    imports: [NgIf, CloseButton],
    template: `
      <div class="space-y-5 p-5 max-w-md">
        <div class="space-y-2">
          <h2 class="text-2xl font-normal">
            {{ data.props.title }}
          </h2>
          <p class="text-gray-800">{{ data.props.body }}</p>
        </div>
        <form method="dialog" class="flex justify-end">
          <button type="button" (click)="close('ok')" class="primary mt-3">Continue</button>
        </form>
      </div>
    `
  })
  export class ContinueDialog extends Dialog { }