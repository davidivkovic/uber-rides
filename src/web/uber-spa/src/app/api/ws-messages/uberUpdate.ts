import { ridesStore } from '@app/stores'

enum UberStatus {
  LOOKING = 'LOOKING',
  FOUND = 'FOUND',
  NO_DRIVERS = 'NO_DRIVERS',
  NO_ROUTE = 'NO_ROUTE',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

export default (message: { status: UberStatus }) => {
  ridesStore.setState(store => store.state.uberFound = message.status === UberStatus.FOUND)
}