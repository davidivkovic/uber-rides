import { ridesStore } from "@app/stores/ridesStore"

export default (message: string[0]) => {
  if (message[0] === ridesStore.state?.instructions) return
  ridesStore.setState(store => store.state.instructions = message[0])
}