enum InboundMessages {
  TRIP_INVITE = 'TRIP_INVITE',
  TRIP_INVITE_UPDATE = 'TRIP_INVITE_UPDATE',
  CAR_LOCATION = 'CAR_LOCATION'
}

enum OutboundMessages {
  ANSWER_TRIP_INVITE = 'ANSWER_TRIP_INVITE',
  REMOVE_TRIP_PASSENGER = 'REMOVE_TRIP_PASSENGER'
}


const createMessage = (type: OutboundMessages, message: any) => {
  if (typeof message !== 'string') message = JSON.stringify(message)
  return type + '\n' + message
}

export { InboundMessages, OutboundMessages, createMessage }