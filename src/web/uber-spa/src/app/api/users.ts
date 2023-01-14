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

const update = async (
  user: {
    firstName: string
    lastName: string
    city: string
    phoneNumber: string
  },
  profilePicture: File
) => {
  const form = new FormData()
  Object.entries(user).forEach(([key, value]) => form.append(key, value))
  profilePicture && form.append('profilePictureFile', profilePicture, profilePicture.name)

  const response = await fetch(
    basePath + '/updates',
    {
      method: 'POST',
      body: form
    }
  )

  if (!response.ok) throw new Error(await response.text())
}

const getUpdateRequests = async (page = 0) => {
  const response = await fetch(
    basePath + '/updates?page=' + page,
    {
      method: 'GET'
    }
  )

  if (response.ok) return await response.json()
  return []
}

const resolveUpdateRequest = async (id: string, action: 'ACCEPT' | 'REJECT') => {
  const response = await fetch(
    basePath + `/${id}/updates?${new URLSearchParams({ action })}`,
    {
      method: 'POST'
    }
  )

  if (!response.ok) throw new Error(await response.text())
}

const changeBlock = async (
  userId: number,
  blocked: boolean | any,
  blockReason: string
) => {
  const response = await fetch(
    basePath + `/${userId}/block?${new URLSearchParams({ blocked, blockReason })}`,
    {
      method: 'POST'
    }
  )

  if (!response.ok) throw new Error(await response.text())
}

const getRiders = async (page: any = 0, query: string) => {
  const response = await fetch(
    '/riders?' + new URLSearchParams({ page, query }),
    {
      method: 'GET'
    }
  )
  if (response.ok) return await response.json()
  return []
}

const getDrivers = async (page: any = 0, criteria: 'ACTIVE' | 'ALL', query: string) => {
  const response = await fetch(
    '/drivers?' + new URLSearchParams({ page, criteria, query }),
    {
      method: 'GET'
    }
  )
  if (response.ok) return await response.json()
  return []
}

export default {
  getProfile,
  update,
  getUpdateRequests,
  resolveUpdateRequest,
  changeBlock,
  getRiders,
  getDrivers
}
