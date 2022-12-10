import { Component } from '@angular/core'
import { DialogData } from '@app/stores'

@Component({
  standalone: true,
  template: ``
})
export class Dialog {

  props: any

  constructor(public data: DialogData) {
    this.props = data.props
  }

  close = (data?: any) => {
    this.data.onclose(data)
    this.data.close()
  }
}