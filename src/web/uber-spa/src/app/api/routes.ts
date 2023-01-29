import dayjs from 'dayjs'
import { fetch } from '.'

type Location = {
  longitude: number
  latitude: number
}

const basePath = '/routes'

const favorites = async () => {
  const response = await fetch(
    basePath + '/favorites',
    {
      method: 'GET'
    }
  )
  if (!response.ok) return []
  return await response.json()
}

const createFavorite = async (routeId: string) => {
  const response = await fetch(
    basePath + '/favorites?' + new URLSearchParams({ routeId }).toString(),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const removeFavorite = async (routeId: string) => {
  const response = await fetch(
    basePath + '/favorites/' + routeId + '/remove',
    {
      method: 'POST',
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const preview = async (data: {
  originPlaceId: string
  destinationPlaceId: string
  waypointPlaceIds: string[],
  routingPreference: 'respect-waypoints' | 'fastest-route' | 'cheapest-route',
  scheduledAt: dayjs.Dayjs
}) => {
  const response = await fetch(
    basePath + '/preview',
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  )
  if (response.ok) return await response.json()
  throw new Error(await response.text())
}

const geocode = async (data: {
  placeId?: string
  address?: string
  location?: google.maps.LatLng
}) => {
  const lat = data.location?.lat()
  const lng = data.location?.lng()
  const response = await fetch(
    basePath + '/geocode',
    {
      method: 'POST',
      body: JSON.stringify({
        placeId: data.placeId,
        address: data.address,
        lat,
        lng
      })
    }
  )
  if (response.ok) return await response.json()
  throw new Error(await response.text())
}

export default {
  favorites,
  createFavorite,
  removeFavorite,
  preview,
  geocode
}