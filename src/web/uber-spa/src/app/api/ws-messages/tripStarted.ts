import { ridesStore, userStore } from "@app/stores"
import { createInfoWindow, createMarker, createPolyline, map } from "../google-maps"

export default async (message: { trip: any }) => {
  if (userStore.user.role === 'ROLE_DRIVER') {
    const stops = [message.trip.route.start, ...message.trip.route.stops]
    const tripPolyline = createPolyline(message.trip.route.encodedPolyline)
    const tripMarkers = stops.map((stop, index) => {
      return createMarker(stop.latitude, stop.longitude, index === stops.length - 1)
    })
    const tripInfoWindows = stops.map((stop, index) => {
      return createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
    })
    ridesStore.state.pickupPolyline?.setMap(null)
    ridesStore.state.pickupMarker?.setMap(null)
    ridesStore.setState(store => {
      store.state.trip = message.trip
      store.state.pickupPolyline = tripPolyline
      store.state.pickupMarker = tripMarkers
      store.state.pickupInfoWindows = tripInfoWindows
    })
    map.fitBounds(new google.maps.LatLngBounds(
      message.trip.route.bounds.southwest,
      message.trip.route.bounds.northeast
    ))
    await window.router.navigate(['/drive'])
    window.detector.detectChanges()
  }
}