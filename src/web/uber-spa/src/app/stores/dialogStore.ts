import { action, state, createStore } from 'usm-mobx'
import { Dialog } from '../components/ui/dialog'

class DialogData {
  id: string
  component: () => typeof Dialog
  props: any
  close: () => void
  onclose: (data?: any) => void
  nativeElement?: HTMLDialogElement
}

class DialogStore {
  
  @state
  dialogs: DialogData[] = []

  @action 
  openDialog(
    component: typeof Dialog,
    props: {},
    onclose: (param: any) => void = () => { }
  ) {
    const id = `dialog-${this.dialogs.length}`
    this.dialogs.push({
      id,
      component: () => component,
      props,
      close: () => this.closeDialog(id),
      onclose
    })
  }

  @action
  setNativeElement(element: HTMLDialogElement) {
    this.dialogs.find(d => d.id == element.id).nativeElement = element
  }

  @action
  closeDialog(id: string) {
    this.dialogs.find(d => d.id == id).nativeElement.close()
    this.dialogs = this.dialogs.filter(d => d.id != id)
  }

  getData = (id: string) => this.dialogs.find(d => d.id == id)
}

const dialogStore = new DialogStore()

createStore({
  modules: [dialogStore]
})

export { dialogStore, DialogData }