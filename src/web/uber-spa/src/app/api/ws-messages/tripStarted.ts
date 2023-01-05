import { ridesStore, userStore } from "@app/stores"
import { createInfoWindow, createMarker, createPolyline, map, removeAllElements } from "../google-maps"

export default async (message: { trip: any }) => {
  const stops = [message.trip.route.start, ...message.trip.route.stops]
  removeAllElements()
  const tripPolyline = createPolyline(message.trip.route.encodedPolyline)
  const tripMarkers = stops.map((stop, index) => {
    return createMarker(stop.latitude, stop.longitude, index === stops.length - 1)
  })
  const tripInfoWindows = stops.map((stop, index) => {
    return createInfoWindow(stop.latitude, stop.longitude, stop.address, index, stops.length)
  })
  ridesStore.mapElements.pickupPolyline?.setMap(null)
  ridesStore.mapElements.pickupMarker?.setMap(null)
  ridesStore.setState(store => {
    store.data.trip = message.trip
    store.mapElements.pickupPolyline = tripPolyline
    store.mapElements.pickupMarker = tripMarkers
    store.data.pickupInfoWindows = tripInfoWindows
    store.data.tripInProgress = true
  })
  map.fitBounds(new google.maps.LatLngBounds(
    {
      lat: message.trip.route.swBounds.latitude,
      lng: message.trip.route.swBounds.longitude
    },
    {
      lat: message.trip.route.neBounds.latitude,
      lng: message.trip.route.neBounds.longitude
    })
  )
  if (userStore.user.role === 'ROLE_DRIVER') {
    await window.router.navigate(['/drive'])
  }
  window.detector.detectChanges()
}