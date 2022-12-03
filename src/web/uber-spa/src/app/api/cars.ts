import { fetch } from '.'

const basePath = '/cars'

const getAllCarTypes = async () => {
  const response = await fetch(
    '/types',
    {
      method: 'GET'
    }
  )
  const carsJson = await response.json()
  return carsJson
}

export default {
    getAllCarTypes
}
