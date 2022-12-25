import { ridesStore } from '@app/stores/ridesStore';
import { userStore } from '@app/stores';
import { carMarkers, map } from '@app/api/google-maps'

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
  heading: number
}) => {
  if ((window as any)?.google?.maps === undefined) return

  const position = new google.maps.LatLng(message.latitude, message.longitude)
  const carRemoved = position.lat() === 0 && position.lng() === 0
  const isSelf = userStore.user?.car?.registration === message.registration
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
    if (ridesStore.state?.pickupPolyline) {
      let shortestDistance = { value: Infinity, previousIndex: 0, nextIndex: 0 }
      let path = ridesStore.state.pickupPolyline.getPath().getArray() as google.maps.LatLng[]
      for (let i = path.length - 1; i > 0; i--) {
        const distance = {
          previous: google.maps.geometry.spherical.computeDistanceBetween(position, path[i - 1]),
          next: google.maps.geometry.spherical.computeDistanceBetween(position, path[i])
        }
        const carHeading = google.maps.geometry.spherical.computeHeading(path[i - 1], position)
        const heading = google.maps.geometry.spherical.computeHeading(path[i - 1], path[i])
        const distanceBetween = distance.previous + distance.next
        if (distanceBetween > 0 && distanceBetween <= shortestDistance.value && Math.abs(carHeading - heading) < 5) {
          shortestDistance.value = distanceBetween
          shortestDistance.previousIndex = i - 1
          shortestDistance.nextIndex = i
        }
      }
      path = shortestDistance.previousIndex === 0 ? path.slice(1) : path.slice(shortestDistance.nextIndex)
      path.unshift(position)
      ridesStore.state.pickupPolyline.setPath(path)
      if (google.maps.geometry.spherical.computeDistanceBetween(
        ridesStore.state.pickupMarker.getPosition(),
        position
      ) < 100) {
        ridesStore.setState(store => store.state.pickup.canStart = true)
      }
    }
    // getMarkerDom(message.registration)?.classList?.add
    ridesStore.setState(store => store.state.currentLocation = position)
    map.panTo(position)
    map.panBy(-180, 0)
  }
}