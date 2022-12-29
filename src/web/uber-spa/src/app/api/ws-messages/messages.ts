enum InboundMessages {
  TRIP_INVITE = 'TRIP_INVITE',
  TRIP_INVITE_UPDATE = 'TRIP_INVITE_UPDATE',
  CAR_LOCATION = 'CAR_LOCATION',
  TRIP_ASSIGNED = 'TRIP_ASSIGNED',
  INSTRUCTIONS = 'INSTRUCTIONS',
  TRIP_STARTED = 'TRIP_STARTED',
  UBER_UPDATE = 'UBER_UPDATE',
  TRIP_ENDED = 'TRIP_ENDED'
}

enum OutboundMessages {
  ANSWER_TRIP_INVITE = 'ANSWER_TRIP_INVITE',
  REMOVE_TRIP_PASSENGER = 'REMOVE_TRIP_PASSENGER',
  NOT_LOOKING = 'NOT_LOOKING'
}


const createMessage = (type: OutboundMessages, message: any = {}) => {
  if (typeof message !== 'string') message = JSON.stringify(message)
  return type + '\n' + message
}

export { InboundMessages, OutboundMessages, createMessage }