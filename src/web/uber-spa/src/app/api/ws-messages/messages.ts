enum InboundMessages {
  TRIP_INVITE = 'TRIP_INVITE',
  TRIP_INVITE_UPDATE = 'TRIP_INVITE_UPDATE',
  CAR_LOCATION = 'CAR_LOCATION',
  TRIP_ASSIGNED = 'TRIP_ASSIGNED',
  INSTRUCTIONS = 'INSTRUCTIONS',
  TRIP_STARTED = 'TRIP_STARTED',
  UBER_UPDATE = 'UBER_UPDATE',
  TRIP_ENDED = 'TRIP_ENDED',
  TRIP_CANCELLED = 'TRIP_CANCELLED',
  SYNC_STATUS = 'SYNC_STATUS',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  TRIP_REMINDER = 'TRIP_REMINDER',
  FATIGUE = 'FATIGUE'
}

enum OutboundMessages {
  ANSWER_TRIP_INVITE = 'ANSWER_TRIP_INVITE',
  REMOVE_TRIP_PASSENGER = 'REMOVE_TRIP_PASSENGER',
  NOT_LOOKING = 'NOT_LOOKING',
  ONLINE = 'ONLINE',
  MESSAGE_SENT = 'MESSAGE_SENT'
}

export { InboundMessages, OutboundMessages }