import { carMarkers, map, serializableState, serializeState } from '@app/api/google-maps'
import { userStore, ridesStore } from '@app/stores'

const blackCarThumbnail = 'https://i.imgur.com/CZ8ufVo.png'
const whiteCarThumbnail = 'https://i.imgur.com/4eo1JxA.png'

const getMarkerDom = (id: string): HTMLImageElement => document.querySelector(`img[src*="id=${id}"]`)

const findMarker = (id: string) => carMarkers.find(m => m.getTitle() === id)

const rotateMarker = (id: string, heading: number) => {
  const markerDom = getMarkerDom(id)
  if (markerDom) {
    markerDom.style.transform = `rotate(${heading}deg)`
  }
}

export default (message: {
  registration: string
  type: string
  latitude: number
  longitude: number
  driverDuration: number
  driverDistance: number
  heading: number
}) => {
  if ((window as any)?.google?.maps === undefined) return

  const position = new google.maps.LatLng(message.latitude, message.longitude)
  const carRemoved = position.lat() === 0 && position.lng() === 0
  const isSelf =
    userStore.user?.car?.registration === message.registration ||
    ridesStore.data.trip?.car?.registration === message.registration
  let marker = findMarker(message.registration)

  if (carRemoved) {
    return marker && marker.setMap(null)
  }
  else if (!marker) {
    marker = new google.maps.Marker({
      title: message.registration,
      position,
      map: map,
      visible: false,
      opacity: 0,
      icon: {
        url: (message.type === 'UBER_BLACK' ? blackCarThumbnail : whiteCarThumbnail) + `?id=${message.registration}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
    })
    marker.addListener('visible_changed', () => {
      setTimeout(() => {
        rotateMarker(message.registration, message.heading)
        marker.setOpacity(1)
      }, 500)
    })
    marker.setVisible(true)
    carMarkers.push(marker)
  }
  else {
    if (marker.getMap() !== map) marker.setMap(map)
    marker.setPosition(position)
    rotateMarker(message.registration, message.heading)
  }

  if (isSelf) {
    if (ridesStore.data.trip || ridesStore.data.pickup) {
      let idx = 0
      let path = ridesStore.mapElements.pickupPolyline.getPath().getArray() as google.maps.LatLng[]
      for (let i = 0; i < path.length - 1; i++) {
        const edge = google.maps.geometry.poly.isLocationOnEdge(position, new google.maps.Polyline({ path: [path[i], path[i + 1]] }), 0.0001)
        if (edge) {
          idx = i
          break
        }
      }
      path = idx === 0 ? path.slice(1) : path.slice(idx + 1)
      path.unshift(position)
      ridesStore.mapElements.pickupPolyline.setPath(path)
      serializableState.polylines.forEach((p: any) => {
        p.name === 'pickup' && (p.path = path)
      })
      serializeState(true)
      ridesStore.setState(store => {
        if (!ridesStore.data.pickup) return
        store.data.pickup.driverDuration = message.driverDuration
        store.data.pickup.driverDistance = message.driverDistance
      })

      const canStart = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(ridesStore.data.trip.route.start.latitude, ridesStore.data.trip.route.start.longitude),
        position
      ) <= 50
      const canFinish = google.maps.geometry.spherical.computeDistanceBetween(
        path[path.length - 1],
        position
      ) <= 50

      ridesStore.setState(store => store.data.pickup.canStart = canStart)
      ridesStore.setState(store => store.data.trip.canFinish = canFinish)

      window.detector.detectChanges()
    }
    // getMarkerDom(message.registration)?.classList?.add
    ridesStore.setState(store => store.data.currentLocation = position)
    map.panTo(position)
    map.panBy(-180, 0)
  }
}