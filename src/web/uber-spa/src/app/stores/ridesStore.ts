import { directions } from '@app/api/google-maps';
import { action, state, createStore, computed } from 'usm-mobx'
import dayjs from 'dayjs'

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
  state = {} as any

  @action
  setState(thunk: (instance: RidesStore) => void) {
    thunk(this)
  }
}

const ridesStore = new RidesStore()

createStore({
  modules: [ridesStore]
})

export { ridesStore }
