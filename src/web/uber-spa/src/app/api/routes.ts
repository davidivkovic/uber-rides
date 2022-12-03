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

const createFavorite = async (data: {
  name: string
  start: Location
  stops: Location[]
}) => {
  const response = await fetch(
    basePath + '/favorites',
    {
      method: 'POST',
      body: JSON.stringify(data)
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

export default { favorites, createFavorite, removeFavorite }