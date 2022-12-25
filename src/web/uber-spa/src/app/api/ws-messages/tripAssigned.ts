import { createMarker, createPolyline } from '@app/api/google-maps'
import { ridesStore } from '@app/stores/ridesStore'

export default (message: { trip: any, directions: any } | any) => {
  const points = google.maps.geometry.encoding.decodePath(message.directions.routes[0].overviewPolyline.encodedPath)
  const desintaion = points[points.length - 1]
  const marker = createMarker(desintaion.lat(), desintaion.lng(), true)
  const polyline = createPolyline(points)
  message.distance = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.distance.inMeters, 0)
  message.duration = message.directions.routes[0].legs.reduce((a: any, b: any) => a + b.duration.inSeconds, 0)
  message.trip.riders.forEach((passenger: any) => passenger.accepted = true)
  ridesStore.setState(store => {
    store.state.pickup = message
    store.state.pickupPolyline = polyline
    store.state.pickupMarker = marker
  })
}