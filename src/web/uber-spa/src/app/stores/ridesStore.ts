import { markers, polylines } from '@app/api/google-maps'
import { action, state, createStore, subscribe } from 'usm-mobx'

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
  mapElements = {
    pickupPolyline: null as google.maps.Polyline,
    pickupMarkers: [] as google.maps.Marker[],
    pickupInfoWindows: [] as google.maps.InfoWindow[]
  }

  @action
  setMapElements() {
    this.mapElements = {
      pickupPolyline: polylines.find((p: any) => p.name === 'pickup'),
      pickupMarkers: markers.filter((m: any) => m.name === 'pickup'),
      pickupInfoWindows: []
    }
  }

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
