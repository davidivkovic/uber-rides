
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import relativeTimePlugin from 'dayjs/plugin/relativeTime'

dayjs.extend(durationPlugin)
dayjs.extend(relativeTimePlugin)

const formatDistance = (distanceInMeters: number) => {
  if (distanceInMeters == null) return ''
  distanceInMeters = Math.max(distanceInMeters, 0)
  if (distanceInMeters >= 1000) {
    const distanceInKm = distanceInMeters / 1000.0
    const precision = distanceInKm % 1 > 0.05 ? 1 : 0
    return distanceInKm.toFixed(precision) + " km"
  }
  return Math.round(distanceInMeters).toFixed(0) + " m"
}

const formatDuration = (durationInSeconds: number) => {
  if (durationInSeconds == null) return ''
  durationInSeconds = Math.max(durationInSeconds, 60)
  const duration = dayjs.duration(durationInSeconds, 'seconds')
  const format = durationInSeconds > 3600 ? 'H[h] m[min]' : 'm[min]'
  return duration.format(format)
}

const formatAddress = (address: string) => {
  return address.split(',').splice(0, 2).join(', ')
}

export { formatDistance, formatDuration, formatAddress }