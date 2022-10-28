import { AfterViewInit, Component, ContentChildren, ElementRef, ViewChild } from '@angular/core'
import { DialogData, dialogStore } from 'src/app/stores'
import { uid } from 'src/app/utils'
import DialogOutlet from './dialogOutlet'


@Component({
  standalone: true,
  template: `
      <button (click)="close()">X</button>
      <p>Counter: {{ data.props.counter }}</p>
      <button (click)="close('ok')">OK</button>
      <p>Counter: 1</p>
  `,
})
export class Dialog {
  constructor(public data: DialogData) { }

  close = (data?: any) => {
    this.data.onclose(data)
    this.data.close()
  }
}