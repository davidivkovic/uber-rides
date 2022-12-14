import { action, state, createStore } from 'usm-mobx'
import { Dialog } from '../components/ui/dialog'

class DialogData {
  id: string
  component: () => typeof Dialog
  props: any
  close: (param?: any) => void
  nativeElement?: HTMLDialogElement
}

class DialogStore {

  @state
  dialogs: DialogData[] = []

  @action
  openDialog(
    component: typeof Dialog,
    props: { noCloseButton: boolean } | {},
    onclose: (param: any) => void = () => { }
  ) {
    const id = `dialog-${this.dialogs.length}`
    this.dialogs.push({
      id,
      component: () => component,
      props,
      close: param => {
        onclose(param)
        this.closeDialog(id)
      },
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
    window.detector.detectChanges()
  }

  @action
  closeOneByType<T extends typeof Dialog>(type: T) {
    this.dialogs.find(d => typeof d.component() === typeof type)?.nativeElement?.close()
    this.dialogs = this.dialogs.filter(d => typeof d.component() !== typeof type)
    window.detector.detectChanges()
  }

  getData = (id: string) => this.dialogs.find(d => d.id == id)
}

const dialogStore = new DialogStore()

createStore({
  modules: [dialogStore]
})

export { dialogStore, DialogData }