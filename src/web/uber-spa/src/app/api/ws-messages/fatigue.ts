import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { ridesStore, userStore } from '@app/stores'
import { send } from '../ws'
import { OutboundMessages } from './messages'

dayjs.extend(utc)
dayjs.extend(tz)

export default (message: {
  isFatigued: boolean
  minutesFatigue: number
  fatigueEnd: string
}) => {
  ridesStore.setState(store => {
    const minutesLeft = 480 - message.minutesFatigue
    store.data.fatigue = {
      minutesLeft,
      driveTime: formatDriveTime(minutesLeft),
      fatigueEnd: dayjs.utc(message.fatigueEnd).diff(dayjs(), 'hours'),
      isFatigued: message.isFatigued
    }
    if (message.isFatigued && userStore.user.isOnline) {
      send(OutboundMessages.ONLINE, { isOnline: false })
      userStore.setIsOnline(false)
    }
  })
}

export const formatDriveTime = (minutesLeft: number) => {
  const hours = Math.floor(minutesLeft / 60)
  const minutes = minutesLeft % 60
  return `${hours.toFixed(0)}h ${minutes.toFixed(0)}m`
}
