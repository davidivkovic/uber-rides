import { ridesStore } from '@app/stores/ridesStore'
import { carMarkers, map } from '@app/api/google-maps'

const blackCarThumbnail = 'https://i.imgur.com/CZ8ufVo.png'
const whiteCarThumbnail = 'https://i.imgur.com/4eo1JxA.png'

const getMarkerDom = (id: string): HTMLImageElement => document.querySelector(
  `#car-markers-overlay img[src*="id=${id}"]`
)

export default (message: {
  registration: string
  type: string
  latitude: number
  longitude: number
  heading: number
}) => {
  if ((window as any)?.google?.maps === undefined) return

  const position = { lat: message.latitude, lng: message.longitude }
  const carRemoved = position.lat === 0 && position.lng === 0
  let markerDom = getMarkerDom(message.registration)

  if (carRemoved) {
    const marker = carMarkers.find(m => m.getTitle() === message.registration)
    if (marker) {
      marker.setMap(null)
    }
  }
  else if (!markerDom) {
    const marker = new google.maps.Marker({
      title: message.registration,
      position,
      map: map,
      icon: {
        url: (message.type === 'UBER_BLACK' ? blackCarThumbnail : whiteCarThumbnail) + `?id=${message.registration}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      }
    })

    carMarkers.push(marker)

    const overlay = new google.maps.OverlayView()
    overlay.draw = function () { this.getPanes().markerLayer.id = 'car-markers-overlay' }
    overlay.setMap(map)

    markerDom = getMarkerDom(message.registration)
  }
  else {
    const marker = carMarkers.find(m => m.getTitle() === message.registration)
    if (marker) {
      marker.setPosition(position)
    }
  }

  if (!carRemoved && markerDom) {
    markerDom.style.transform = `rotate(${message.heading}deg)`
  }
}