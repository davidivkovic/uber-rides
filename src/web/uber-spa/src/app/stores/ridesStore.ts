import { action, state, createStore, computed } from 'usm-mobx'

class RidesStore {


}

const ridesStore = new RidesStore()

createStore({
  modules: [ridesStore]
})

export { ridesStore }
