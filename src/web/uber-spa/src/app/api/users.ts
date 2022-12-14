import { fetch } from '.'

const basePath = '/users'

const getProfile = async () => {
  const response = await fetch(basePath + '/', {
    method: 'GET'
  })

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

  const response = await fetch(basePath + '/updates', {
    method: 'POST',
    body: form
  })

  if (!response.ok) throw new Error(await response.text())
}

export default {
  getProfile,
  update,
}
