import { fetch } from '.'
const basePath = '/payments'

const generatePaypalToken = async () => {
  const repsonse = await fetch(basePath + '/token', { method: 'GET' })
  return repsonse.text()
}

const getMethods = async () => {
  const response = await fetch(basePath + '/methods', { method: 'GET' })
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const addPaypal = async (nonce: string, email: string, setDefault: boolean = false) => {
  const response = await fetch(
    decodeURIComponent(basePath + '/methods/paypal?' + new URLSearchParams({ nonce, email, setDefault: setDefault.toString() }).toString()),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const addCard = async (data: {
  nickname: string
  month: number
  year: number
  cardNumber: string
  cvv: string
  country: string
  nonce: string
  setDefault: boolean
}) => {
  const response = await fetch(basePath + '/methods/card', { method: 'POST', body: JSON.stringify(data) })
  if (!response.ok) throw new Error(await response.text())
}

const pay = async (data: { nonce: string, amount: number, email: string }) => {
  const response = await fetch(
    basePath + '/pay',
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const removePaymentMethod = async (id: string) => {
  const response = await fetch(
    basePath + `/methods/${id}/remove`,
    {
      method: 'POST',
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const changeDefault = async (id: string) => {
  const response = await fetch(
    basePath + `/methods/${id}/default`,
    {
      method: 'POST',
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const getDefault = async () => {
  const response = await fetch(basePath + '/methods/default', { method: 'GET' })
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

const analytics = async (userId: number | any, from: any, to: any) => {
  const response = await fetch(
    basePath + '/analytics?' + new URLSearchParams({ userId, from, to }).toString(),
    { method: 'GET' }
  )
  if (response.ok) return await response.json()
  return []
}

export default {
  generatePaypalToken,
  getMethods,
  addPaypal,
  addCard,
  removePaymentMethod,
  pay,
  changeDefault,
  getDefault,
  analytics
}
