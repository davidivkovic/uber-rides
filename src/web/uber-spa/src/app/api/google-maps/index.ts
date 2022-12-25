import jailbreak from './jailbreak'
import mapStyles from './mapStyles.json'
import icons from './icons'

const scriptName = 'google-maps-script'
let map: google.maps.Map
let mapHtmlElement: HTMLElement
let autocomplete: google.maps.places.AutocompleteService
let geocoder: google.maps.Geocoder
let places: google.maps.places.PlacesService
let directions: google.maps.DirectionsService
let elementId: string
let polylines: google.maps.Polyline[] = []
let markers: google.maps.Marker[] = []
let carMarkers: google.maps.Marker[] = []
let infoWindows: google.maps.InfoWindow[] = []
let subscribers = []

jailbreak()

const initMap = () => {
  mapHtmlElement = document.getElementById(elementId)
  map = new google.maps.Map(mapHtmlElement, {
    center: { lat: 40.7459, lng: -73.99999 }, // NYC
    zoom: 15,
    scrollwheel: false,
    styles: mapStyles
  })

  places = new google.maps.places.PlacesService(map)
  autocomplete = new google.maps.places.AutocompleteService()
  geocoder = new google.maps.Geocoder()
  directions = new google.maps.DirectionsService()

  subscribers.forEach((fn: any) => fn())
  subscribers = []
}

const createMarker = (latitude: number, longitude: number, isTerminal: boolean) => {
  const marker = new google.maps.Marker({
    position: {
      lat: latitude,
      lng: longitude
    },
    icon: {
      url: '/assets/images/' + (!isTerminal
        ? 'map-marker-location.png'
        : 'map-marker-destination.png'
      ),
      anchor: {
        x: 8,
        y: 8
      } as any
    },
    map
  })
  markers.push(marker)
  return marker
}

const createPolyline = (path: string | google.maps.LatLng[]) => {
  const polyline = new google.maps.Polyline({
    path: typeof path === 'string' ? google.maps.geometry.encoding.decodePath(path) : path,
    map,
    strokeColor: '#000',
    strokeOpacity: 0.7,
    strokeWeight: 4,
    clickable: false,
  })
  polylines.push(polyline)
  return polyline
}

const createInfoWindow = (
  latitude: number,
  longitude: number,
  address: string,
  index: number,
  arrayLength: number
) => {
  const verb = { 0: 'From', [arrayLength - 1]: 'To' }[index] ?? 'Stop'
  const infoWindow = new google.maps.InfoWindow({
    position: {
      lat: latitude,
      lng: longitude
    },
    content: /*html*/`
      <div id="gm-iw-c-${index}" class="flex items-center px-3 py-2 space-x-2 cursor-pointer">
        <span class="text-[15px] select-none">${verb}: ${address}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M16.9 12l-4.6 6H8.5l4.6-6-4.6-6h3.8l4.6 6z" fill="currentColor">
          </path>
        </svg>
      </div>
    `
  })
  google.maps.event.addListener(infoWindow, 'domready', () => {
    const windowWidth = document.getElementById(`gm-iw-c-${index}`)?.clientWidth ?? 0
    infoWindow.setOptions({ pixelOffset: new google.maps.Size(windowWidth / 2 + 8, 0) })
  })
  infoWindow.open(map)
  infoWindows.push(infoWindow)
}

const removeAllElements = () => {
  polylines?.forEach(l => l.setMap(null))
  markers?.forEach(m => m.setMap(null))
  infoWindows?.forEach(w => w.close())
}

const init = (htmlElementId: string) => {
  if (!document.getElementById(scriptName)) {
    elementId = htmlElementId
    document.head.appendChild(script)
  }
  else {
    initMap()
  }
}

const subscribe = (fn: any) => subscribers.push(fn)

const script = Object.assign(
  document.createElement('script'),
  {
    id: scriptName,
    src: 'https://maps.googleapis.com/maps/api/js?libraries=places,directions,geometry&language=en&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg',
    async: true,
    defer: true,
    onload: initMap
  }
)

export {
  init,
  subscribe,
  map,
  mapHtmlElement,
  autocomplete,
  geocoder,
  directions,
  icons,
  carMarkers,
  polylines,
  createMarker,
  createPolyline,
  createInfoWindow,
  removeAllElements
}