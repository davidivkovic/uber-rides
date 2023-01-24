import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'

import { notificationStore } from '@app/stores'

dayjs.extend(utc)
dayjs.extend(relativeTime)

export default (message: { startTime: string, source: string, destination: string }) => {
  notificationStore.show(`
    Your ride from 
    ${message.source.split(',').splice(0, 2).join(',')} 
    to 
    ${message.destination.split(',').slice(0, 2).join(',')} 
    is scheduled to start
    ${dayjs().to(dayjs.utc(message.startTime))}
    .
  `)
  new Audio('/assets/sounds/payment_success.mp4').play()
}