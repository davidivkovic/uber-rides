import { baseUrl } from '.'
import { InboundMessages, OutboundMessages } from './ws-messages/messages'

const url = 'ws://' + baseUrl + '/ws'
let ws: WebSocket

const handlers = {
  [InboundMessages.TRIP_INVITE]: () => import('./ws-messages/tripInvite'),
  [InboundMessages.TRIP_INVITE_UPDATE]: () => import('./ws-messages/tripInviteUpdate'),
  [InboundMessages.CAR_LOCATION]: () => import('./ws-messages/carLocation'),
  [InboundMessages.TRIP_ASSIGNED]: () => import('./ws-messages/tripAssigned'),
  [InboundMessages.INSTRUCTIONS]: () => import('./ws-messages/instructions'),
  [InboundMessages.TRIP_STARTED]: () => import('./ws-messages/tripStarted'),
  [InboundMessages.UBER_UPDATE]: () => import('./ws-messages/uberUpdate'),
  [InboundMessages.TRIP_ENDED]: () => import('./ws-messages/tripEnded')
}

const isConnected = () => ws?.OPEN

const connect = (accessToken: string) => {
  ws = new WebSocket(`${url}?token=${accessToken}`)
  isConnected() && console.debug('[Connected to WS at ' + url + ']')

  ws.onmessage = async (message: MessageEvent<any>) => {
    const tokens = message.data.split('\n')
    const header = InboundMessages[tokens[0]]
    const body = JSON.parse(tokens[1])

    let handler: { default: (body: any) => void }
    if (handler = await handlers[header]?.()) {
      handler.default?.(body)
    }
  }
}

const send = (type: OutboundMessages, message: any = {}) => {
  if (typeof message !== 'string') message = JSON.stringify(message)
  const packet = type + '\n' + message
  ws?.send(packet)
}

const disconnect = () => {
  ws?.close()
  ws = null
  console.debug('[Disconnected from WS]')
}

export { connect, disconnect, send }