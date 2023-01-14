import { fetch } from '.'

const basePath = '/trips'

const chooseRide = async (rideType: string) => {
  const response = await fetch(
    basePath + '/choose-ride?' + new URLSearchParams({ rideType }).toString(),
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const invitePassengers = async (passengerIds: number[]) => {
  const response = await fetch(
    basePath + '/invite-passengers',
    {
      method: 'POST',
      body: JSON.stringify(passengerIds)
    }
  )
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const orderRide = async () => {
  const response = await fetch(
    basePath + '/order-ride',
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(await response.text())
}

const startTrip = async () => {
  const response = await fetch(
    basePath + '/start',
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(await response.text())
}

const getTrips = async (userId: string, order = 'START_DESC', page: any = 0) => {
  const response = await fetch(
    basePath + '?' + new URLSearchParams({ userId, order, page }).toString(),
    { method: 'GET' }
  )
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const reviewTrip = async (tripId: number, rating: number | any, comment: string) => {
  const response = await fetch(
    basePath + `/${tripId}/review?` + new URLSearchParams({ rating, comment }).toString(),
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(await response.text())
}

const getCurrentTrip = async (userId: number | any) => {
  const response = await fetch(
    basePath + '/current?' + new URLSearchParams({ userId }).toString(),
    { method: 'GET' }
  )
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const cancelTrip = async (reason: string) => {
  const response = await fetch(
    basePath + '/cancel?' + new URLSearchParams({ reason }).toString(),
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(await response.text())
}

export default {
  chooseRide,
  invitePassengers,
  orderRide,
  startTrip,
  getTrips,
  reviewTrip,
  getCurrentTrip,
  cancelTrip
}