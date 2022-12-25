import { baseUrl } from '.'
import { InboundMessages } from './ws-messages/messages'

const url = 'ws://' + baseUrl + '/ws'
let ws: WebSocket

const handlers = {
  [InboundMessages.TRIP_INVITE]: () => import('./ws-messages/tripInvite'),
  [InboundMessages.TRIP_INVITE_UPDATE]: () => import('./ws-messages/tripInviteUpdate'),
  [InboundMessages.CAR_LOCATION]: () => import('./ws-messages/carLocation'),
  [InboundMessages.TRIP_ASSIGNED]: () => import('./ws-messages/tripAssigned'),
  [InboundMessages.INSTRUCTIONS]: () => import('./ws-messages/instructions'),

}

const isConnected = () => ws?.OPEN

const connect = (accessToken: string) => {
  ws = new WebSocket(url + `?token=${accessToken}`)
  isConnected() && console.debug('[Connected to WS at ' + url + ']')

  ws.onmessage = async (message: MessageEvent<any>) => {
    const tokens = message.data.split('\n')
    const header = InboundMessages[tokens[0]]
    const body = JSON.parse(tokens[1])

    let handler: { default: (body: string) => void }
    if (handler = await handlers[header]?.()) {
      handler.default?.(body)
    }
  }
}

const disconnect = () => {
  ws?.close()
  ws = null
  console.debug('[Disconnected from WS]')
}

/**
  NOTE:
  Do not send plain strings.
  Use ./ws-messages/messages/createMessage to create a packet 
**/
const send = (packet: string) => {
  ws?.send(packet)
}


export { connect, disconnect, send }