import { Component } from '@angular/core'
import { DialogData } from '@app/stores'

@Component({
  standalone: true,
  template: ``
})
export class Dialog {
  constructor(public data: DialogData) { }

  close = (data?: any) => {
    console.log(this.data.onclose)
    this.data.onclose(data)
    this.data.close()
  }
}