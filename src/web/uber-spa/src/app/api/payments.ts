import { fetch } from '.'
const basePath = '/payments'

const generatePaypalToken = async () => {
  const repsonse = await fetch(basePath + '/token', { method: 'GET' })
  return repsonse.text()
}

const addPaypal = async (nonce: string, email: string) => {
  const response = await fetch(
    decodeURIComponent(basePath + '/paypal?' + new URLSearchParams({ nonce, email }).toString()),
    {
      method: 'POST'
    }
  )
  if (!response.ok) throw new Error(await response.text())
}

const getPaypal = async () => {
  const repsonse = await fetch(basePath + '/paypal', { method: 'GET' })
  return repsonse.json()
}

const getCards = async () => {
  const repsonse = await fetch(basePath + '/cards', { method: 'GET' })
  return repsonse.json()
}

const removePaypal = async () => {
  const response = await fetch(basePath + '/paypal/remove', { method: 'POST' })
  if (!response.ok) throw new Error(await response.text())
}

const addCard = async (data: {
  nickname: string
  cardNumber: string
  cvv: string
  expirationDate: string
  country: string
}) => {
  const response = await fetch(basePath + '/card', { method: 'POST', body: JSON.stringify(data) })
  if (!response.ok) throw new Error(await response.text())

  return await response.json()
}

const removeCard = async (cardId: number) => {
  const response = await fetch(basePath + `/cards/${cardId}/remove`, { method: 'POST' })
  if (!response.ok) throw new Error(await response.text())
}

export default {
  addPaypal,
  generatePaypalToken,
  getPaypal,
  addCard,
  getCards,
  removePaypal,
  removeCard
}
