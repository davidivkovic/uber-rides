import { Component } from '@angular/core'
import { Dialog } from '@app/components/ui/dialog'
import { CloseButton } from '@app/components/ui/base/closeButton'

@Component({
  standalone: true,
  imports: [CloseButton],
  template: `
    <div class="flex flex-col w-[320px] h-[360px]">
      <h2 class="text-2xl font-normal">
        {{ data.props.title }}
      </h2>
      <p class="text-gray-800">{{ data.props.body }}</p>
      <button type="button" (click)="close('ok')" class="primary w-full mt-auto">Continue</button>
    </div>
  `
})
export class ContinueDialog extends Dialog { }