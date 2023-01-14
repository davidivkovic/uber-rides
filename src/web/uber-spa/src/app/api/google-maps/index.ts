import { ridesStore } from '@app/stores';
import jailbreak from './jailbreak'
import mapStyles from './mapStyles.json'
import icons from './icons'
import { formatAddress } from '@app/utils'

const scriptName = 'google-maps-script'
const stateKey = 'google-maps-state'

let loaded = false
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
let onLoadedCallbacks = []
let serializableState = localStorage.getItem(stateKey)
  ? JSON.parse(localStorage.getItem(stateKey))
  : {
    markers: [],
    polylines: [],
    infoWindows: []
  }


const subscribe = (fn: any) => subscribers.push(fn)

const serializeState = (skipChecks = false) => {
  serializableState.polylines = serializableState.polylines.filter(p => p?.canSerialize?.() || skipChecks)
  serializableState.markers = serializableState.markers.filter(m => m?.canSerialize?.() || skipChecks)
  serializableState.infoWindows = serializableState.infoWindows.filter(iw => iw?.canSerialize?.() || skipChecks)
  localStorage.setItem(stateKey, JSON.stringify(serializableState))
}

const initMap = () => {
  if (elementId !== '') {
    mapHtmlElement = document.getElementById(elementId)
    map = new google.maps.Map(mapHtmlElement, {
      center: { lat: 40.7459, lng: -73.99999 }, // NYC
      zoom: 15,
      scrollwheel: false,
      styles: mapStyles
    })
    places = new google.maps.places.PlacesService(map)
  }

  autocomplete = new google.maps.places.AutocompleteService()
  geocoder = new google.maps.Geocoder()
  directions = new google.maps.DirectionsService()

  subscribers.forEach((fn: any) => fn())
  subscribers = []
}

const createMarker = (
  latitude: number,
  longitude: number,
  isTerminal: boolean,
  name = '',
  serialize = true
) => {
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
  });
  (marker as any).name = name
  markers.push(marker)

  if (serialize) {
    serializableState.markers.push({
      latitude,
      longitude,
      isTerminal,
      canSerialize: () => marker.getMap() != null && marker.getMap() === map
    })
    serializeState()
  }

  return marker
}

const createPolyline = (
  path: string | google.maps.LatLng[],
  color = '#000',
  name = '',
  serialize = true
) => {
  const polyline = new google.maps.Polyline({
    path: (typeof path === 'string') ? google.maps.geometry.encoding.decodePath(path) : path,
    map,
    strokeColor: color,
    strokeOpacity: 0.7,
    strokeWeight: 4,
    clickable: false,
  });
  (polyline as any).name = name
  polylines.push(polyline)

  if (serialize) {
    serializableState.polylines.push({
      path,
      color,
      name,
      canSerialize: () => {
        const res = polyline.getMap() != null && polyline.getMap() === map
        console.log(res, polyline.getMap(), map, polyline.getMap() === map, name)
        return res
      }
    })
    serializeState()
  }

  return polyline
}

const createInfoWindow = (
  latitude: number,
  longitude: number,
  address: string,
  index: number,
  arrayLength: number,
  serialize = true
) => {
  const verb = { 0: 'From', [arrayLength - 1]: 'To' }[index] ?? 'Stop'
  const infoWindow = new google.maps.InfoWindow({
    position: {
      lat: latitude,
      lng: longitude
    },
    content: /*html*/`
      <div id="gm-iw-c-${index}" class="flex items-center px-3 py-2 space-x-2 cursor-pointer rounded">
        <span class="text-[15px] select-none">${verb}: ${formatAddress(address)}</span>
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

  if (serialize) {
    serializableState.infoWindows.push({
      latitude,
      longitude,
      address,
      index,
      arrayLength,
      canSerialize: () => (infoWindow as any).getMap() != null && (infoWindow as any).getMap() === map
    })
    serializeState()
  }

  return infoWindow
}

const removeAllElements = () => {
  polylines?.forEach(l => l.setMap(null))
  markers?.forEach(m => m.setMap(null))
  infoWindows?.forEach(w => w.close())
  polylines = []
  markers = []
  infoWindows = []
  serializableState = {
    markers: [],
    polylines: [],
    infoWindows: []
  }
  localStorage.setItem(stateKey, JSON.stringify(serializableState))
}

const refreshAllElements = () => {
  const refresh = () => {
    polylines?.forEach(l => l.getMap() != null && l.setMap(map))
    markers?.forEach(m => m.getMap() != null && m.setMap(map))
    infoWindows?.forEach(w => (w as any).getMap() != null && w.open(map))

    serializableState.infoWindows.forEach(({ latitude, longitude, address, index, arrayLength }) =>
      createInfoWindow(latitude, longitude, address, index, arrayLength, false)
    )
    serializableState.markers.forEach(({ latitude, longitude, isTerminal, name }) =>
      createMarker(latitude, longitude, isTerminal, name, false)
    )
    serializableState.polylines.forEach(({ path, color, name }) => {
      createPolyline(path, color, name, false)
    })
    ridesStore.setMapElements()
  }
  if (map) refresh()
  else subscribe(() => refresh())
}

const key = window.atob('QUl6YVN5Q2tVT2RaNXk3aE1tMHlyY0NRb0N2THd6ZE02TThzNXFr')
const script = Object.assign(
  document.createElement('script'),
  {
    id: scriptName,
    src: 'https://maps.googleapis.com/maps/api/js?libraries=places,directions,geometry&language=en&callback=onLoad&key=' + key,
    async: true,
    defer: true
  }
)

const init = (htmlElementId = '') => {
  elementId = htmlElementId
  if (!document.getElementById(scriptName)) {
    document.head.appendChild(script)
  }
  else if ((window as any).google) {
    (window as any).onLoad()
  }
  else onLoadedCallbacks.push(initMap)
}


(window as any).onLoad = () => {
  if (onLoadedCallbacks.length) {
    onLoadedCallbacks.forEach(c => c())
    onLoadedCallbacks = []
  }
  else {
    initMap()
  }
}

jailbreak()

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
  markers,
  createMarker,
  createPolyline,
  createInfoWindow,
  removeAllElements,
  refreshAllElements,
  serializableState,
  serializeState
}