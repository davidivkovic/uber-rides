import { Component } from '@angular/core'
import { DialogData } from 'src/app/stores'


@Component({
  standalone: true,
  template: ``
})
export class Dialog {
  constructor(public data: DialogData) { }

  close = (data?: any) => {
    this.data.onclose(data)
    this.data.close()
  }
}

@Component({
  standalone: true,
  template: `
      <button (click)="close()">X</button>
      <p>Counter: {{ data.props.counter }}</p>
      <button (click)="close('ok')">OK</button>
      <p>Counter: 1</p>
  `,
})
export class MyDialog extends Dialog { }