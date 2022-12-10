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

  // @state
  // rideBuilder: {
  //   scheduledAt: dayjs.Dayjs,
  //   rideChosen: boolean
  //   passengers: any[]
  // } = {
  //   rideChosen: false,
  //   scheduledAt: null,
  //   passengers: []
  // } as any

  // @state
  // directions: any = {}

  // @action
  // setDirections(directions: any) {
  //   this.directions = directions
  // }

  // @action
  // setPassengers(passengers: any[]) {
  //   this.rideBuilder.passengers = passengers
  // }

  // @action
  // removePassenger(passenger: any) {
  //   this.rideBuilder.passengers = this.rideBuilder.passengers.filter(p => p.id !== passenger.id)
  // }

  // @action
  // setRideChosen(chosen: boolean) {
  //   this.rideBuilder.rideChosen = chosen
  // }

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
