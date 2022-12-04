import { fetch } from '.'

const basePath = '/cars'

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

export default {
  getAllCarTypes,
  registerCar
}
