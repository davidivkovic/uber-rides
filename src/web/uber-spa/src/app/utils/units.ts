
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import relativeTimePlugin from 'dayjs/plugin/relativeTime'

dayjs.extend(durationPlugin)
dayjs.extend(relativeTimePlugin)

const formatDistance = (distanceInMeters: number) => {
  if (distanceInMeters >= 1000) {
    const distanceInKm = distanceInMeters / 1000.0
    const precision = distanceInKm % 1 > 0.05 ? 1 : 0
    return distanceInKm.toFixed(precision) + " km"
  }
  return Math.round(distanceInMeters).toFixed(0) + " m"
}

const formatDuration = (durationInSeconds: number) => {
  const duration = dayjs.duration(durationInSeconds, 'seconds')
  const format = durationInSeconds > 3600 ? 'H[h] m[min]' : 'm[min]'
  return duration.format(format)
}

export { formatDistance, formatDuration }