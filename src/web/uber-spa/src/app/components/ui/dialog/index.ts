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