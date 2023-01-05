import { action, state, createStore, watch, subscribe } from 'usm-mobx'

type Location = {
  placeId: string,
  address: string,
  secondaryAddress: string,
  longitude: number,
  latitude: number,
  order?: number
}

class RidesStore {

  locationPicked: Location

  favoriteRoutePicked: {
    name: string,
    start: Location
    stops: Location[]
  }

  @state
  pages = {} as any

  @state
  mapElements = {} as any

  @state
  data = localStorage.getItem('rides-store') ? JSON.parse(localStorage.getItem('rides-store')) : {}

  @action
  setState(thunk: (instance: RidesStore) => void) {
    thunk(this)
  }

  constructor() {
    subscribe(this, () => localStorage.setItem('rides-store', JSON.stringify(this.data)))
  }
}

const ridesStore = new RidesStore()

createStore({
  modules: [ridesStore]
})

export { ridesStore }
