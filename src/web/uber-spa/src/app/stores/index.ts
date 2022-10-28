import { state, action, computed, watch, createStore } from 'usm-mobx'
export * from './dialogStore'

class Counter {
  @state
  count = { sum: 0 }

  @action
  increase() {
    this.count.sum += 1
  }

  @computed
  get double() {
    return this.count.sum * 2
  }

  constructor() {
    // watch(this, () => this.count.sum, () => console.log(this.count.sum))
  }
}

const counter = new Counter()

createStore({
  modules: [counter]
})

export default counter