import { fetch } from '.'

const basePath = '/trips'

const chooseRide = async (rideType: string) => {
  const response = await fetch(
    basePath + '/choose-ride?' + new URLSearchParams({ rideType }).toString(),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const invitePassengers = async (passengerIds: number[]) => {
  const response = await fetch(
    basePath + '/invite-passengers?',
    {
      method: 'POST',
      body: JSON.stringify(passengerIds)
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

export default { chooseRide, invitePassengers }