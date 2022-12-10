import { ridesStore } from '@app/stores/ridesStore'

export default (message: { passengerId: number, status: string }) => {
  ridesStore.setState(store => {
    if (message.status === 'REMOVED') {
      store.state.passengers = store.state.passengers?.filter((p: any) => p.id !== message.passengerId) ?? []
      if (!store.state.passengers.length) store.state.rideChosen = false
    }
    else {
      const passenger = store.state.passengers?.find((p: any) => p.id === message.passengerId)
      if (!passenger) return
      passenger.accepted = message.status === 'ACCEPTED'
      passenger.declined = message.status === 'DECLINED'
    }
  })
}