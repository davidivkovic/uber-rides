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
}

jailbreak()
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

const init = (htmlElementId: string) => {
  if (!document.getElementById(scriptName)) {
    elementId = htmlElementId
    document.head.appendChild(script)
  }
  else {
    initMap()
  }
}

export {
  init,
  map,
  mapHtmlElement,
  autocomplete,
  geocoder,
  directions,
  icons
}