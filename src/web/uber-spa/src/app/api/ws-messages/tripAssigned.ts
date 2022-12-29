import { createInfoWindow, createMarker, createPolyline } from '@app/api/google-maps'
import { userStore } from '@app/stores'
import { ridesStore } from '@app/stores/ridesStore'

export default async (message: { trip: any, directions: any, driverDuration: number, driverDistance: number } | any) => {
  const points = google.maps.geometry.encoding.decodePath(message.directions.routes[0].overviewPolyline.encodedPath)
  const desintaion = points[points.length - 1]
  const pickupMarker = createMarker(desintaion.lat(), desintaion.lng(), true)
  const pickupPolyline = createPolyline(points)
  message.distance = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.distance.inMeters, 0)
  message.duration = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.duration.inSeconds, 0)
  message.trip.riders.forEach((passenger: any) => passenger.accepted = true)
  ridesStore.setState(store => {
    store.state.trip = message.trip
    store.state.pickup = message
    store.state.pickupPolyline = pickupPolyline
    store.state.pickupMarker = pickupMarker
  })
  if (userStore.user.role === 'ROLE_DRIVER') {
    await window.router.navigate(['/pickup'])
    window.detector.detectChanges()
  }
  new Audio('/assets/sounds/trip_assigned.m4r').play()
}