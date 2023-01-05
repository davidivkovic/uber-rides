import { ridesStore } from '@app/stores/ridesStore'

export default (message: string[0]) => {
  if (message[0] === ridesStore.data?.instructions) return
  ridesStore.setState(store => store.data.instructions = message[0])
}