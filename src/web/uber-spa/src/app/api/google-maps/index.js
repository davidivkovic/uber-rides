import jailbreak from './jailbreak'
import mapStyles from './mapStyles.json'

const scriptName = 'google-maps-script'
let map, placesService, elementId

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
  placesService = new google.maps.places.PlacesService(map)
}

const script = Object.assign(
  document.createElement('script'),
  {
    id: scriptName,
    src: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places,visualization,directions&language=en',
    async: true,
    onload: initMap
  }
)

const init = htmlElementId => {
  if (!document.getElementById(scriptName)) {
    elementId = htmlElementId
    jailbreak({
      poiClickHandler: placeId => {
        console.log(placeId)
        // placesService.getDetails(
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


export { init }