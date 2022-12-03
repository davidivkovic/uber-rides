import { action, state, createStore, computed } from 'usm-mobx'
import dayjs from 'dayjs'

class RidesStore {

  locationPicked: {
    placeId: string,
    address: string,
    secondaryAddress: string,
    longitude: number,
    latitude: number
  }

  rideBuilder: {
    scheduledAt: dayjs.Dayjs
  } = {} as any
}

const ridesStore = new RidesStore()

createStore({
  modules: [ridesStore]
})

export { ridesStore }
