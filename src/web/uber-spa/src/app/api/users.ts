import { fetch } from '.'

const basePath = '/users'

const getProfile = async () => {
  const response = await fetch(
    basePath + '/',
    {
      method: 'GET'
    }
  )
  if (response.ok) return await response.json()
  throw new Error(await response.text())
}

export default { getProfile }