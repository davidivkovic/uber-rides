import { fetch } from '.'

const basePath = '/cars'
let isPolling = false
let delays = {}

const getAllCarTypes = async () => {
  const response = await fetch(basePath + '/types', {
    method: 'GET'
  })
  const carsJson = await response.json()
  return carsJson
}

const registerCar = async (data: {
  userId: number
  type: string
  make: string
  model: string
  year: number
  registration: string
}) => {
  const response = await fetch(basePath, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error(await response.text())
}

const pollLiveLocations = async () => {


  const getLiveLocations = () => fetch(
    basePath + '/live-locations',
    { method: 'GET' }
  )

  const handler = await import('./ws-messages/carLocation')

  let response = await getLiveLocations()
  for (const carLocation of await response.json()) {
    handler.default(carLocation)
  }

  if (isPolling) return
  isPolling = true

  setInterval(async () => {
    response = await getLiveLocations()
    for (const carLocation of await response.json()) {
      if (!delays[carLocation.registration]) {
        delays[carLocation.registration] = Math.random() * 5000
      }
      setTimeout(() => handler.default(carLocation), delays[carLocation.registration])
    }
  }, 5000)
}

export default {
  getAllCarTypes,
  registerCar,
  pollLiveLocations
}
