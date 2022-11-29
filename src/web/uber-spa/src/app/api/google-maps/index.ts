import jailbreak from './jailbreak'
import mapStyles from './mapStyles.json'
import icons from './icons'

const scriptName = 'google-maps-script'
let map: google.maps.Map
let autocomplete: google.maps.places.AutocompleteService
let geocoder: google.maps.Geocoder
let places: google.maps.places.PlacesService
let elementId: string

const initMap = () => {
  map = new google.maps.Map(document.getElementById(elementId), {
    center: { lat: 40.7459, lng: -73.99999 },
    zoom: 15,
    // restriction: {
    //   latLngBounds: {
    //     north: 45.32,
    //     south: 45.20,
    //     west: 19.69,
    //     east: 19.90
    //   }
    // },
    styles: mapStyles
  })
  console.log('[GOOGLE MAPS] Initialized')
  places = new google.maps.places.PlacesService(map)
  autocomplete = new google.maps.places.AutocompleteService()
  geocoder = new google.maps.Geocoder()
  autocomplete.getPlacePredictions({ input: 'Test' })
}

const script = Object.assign(
  document.createElement('script'),
  {
    id: scriptName,
    src: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk&libraries=places,directions&language=en',
    async: true,
    defer: true,
    onload: initMap
  }
)

const init = htmlElementId => {
  if (!document.getElementById(scriptName)) {
    elementId = htmlElementId
    jailbreak({
      poiClickHandler: placeId => {
        console.log(placeId)
        // places.getDetails(
        //   { placeId: e.placeId },
        //   (place, status) => {
        //     console.log({ place, status })
        //   }
        // )
      }
    })
    document.head.appendChild(script)
  }
  else {
    initMap()
  }
}

export { init, autocomplete, geocoder, icons }