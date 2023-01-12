import { fetch } from '.'
const basePath = '/chats'

const getAllChats = async () => {
  const response = await fetch(basePath + '/', {
    method: 'GET'
  })
  return await response.json()
}

const getChat = async (id: string) => {
  const response = await fetch(basePath + '/' + id, {
    method: 'GET'
  })
  return await response.json()
}

const getClientChat = async () => {
  const response = await fetch(basePath + '/recent', {
    method: 'GET'
  })
  return await response.json()
}

export {
    getAllChats,
    getChat,
    getClientChat
}
