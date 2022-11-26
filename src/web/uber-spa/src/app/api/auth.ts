import { fetch } from '.'
import { userStore } from '@app/stores'

const basePath = '/authentication'

const signUp = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  city: string
  role: string
}) => {
  const response = await fetch(
    basePath + '/register',
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const confirmEmail = async (data: { email: string, code: string }) => {
  const response = await fetch(
    basePath + '/confirm-email?' + new URLSearchParams({ ...data }).toString(),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const resendConfirmation = async (email: string) => {
  const response = await fetch(
    basePath + '/resend-confirmation?' + new URLSearchParams({ email }).toString(),
    {
      method: 'POST'
    }
  )
  const text = await response.text()
  if (response.ok) return text
  throw new Error(text)
}

const login = async (data: { email: string, password: string }) => {
  const response = await fetch(
    basePath + '/signin',
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  )
  if (!response.ok) throw new Error(await response.text())

  const json = await response.json()
  userStore.setUser(json.user, json.accessToken)
}

const googleLogin = async (token: string) => {
  const response = await fetch(
    basePath + '/signin/google?' + new URLSearchParams({ token }).toString(),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())

  const json = await response.json()
  userStore.setUser(json.user, json.accessToken)

  return json.user.completedRegistration
}

const facebookLogin = async (userId: string, token: string) => {
  const response = await fetch(
    basePath + '/signin/facebook?' + new URLSearchParams({ userId, token }).toString(),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())

  const json = await response.json()
  userStore.setUser(json.user, json.accessToken)

  return json.user.completedRegistration
}

export default {
  signUp,
  confirmEmail,
  resendConfirmation,
  login,
  googleLogin,
  facebookLogin
}
