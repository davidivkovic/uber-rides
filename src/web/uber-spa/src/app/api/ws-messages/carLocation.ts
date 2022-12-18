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

  const position = { lat: message.latitude, lng: message.longitude }
  const carRemoved = position.lat === 0 && position.lng === 0
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
    marker.setPosition(position)
    rotateMarker(message.registration, message.heading)
  }
}