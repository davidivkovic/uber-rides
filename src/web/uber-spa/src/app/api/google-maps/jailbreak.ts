export default ({ poiClickHandler }) => {
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    get() {
      return this.getAttribute('src')
    },
    set(value) {
      const src = value.toString()
      if (src.includes('ApplicationService')) {
        poiClickHandler(src.match(/(?<=!4s)[^!]*/)?.at(0))
      }
      if (src.includes('AuthenticationService')) {
        const path = src.match(/(?<=&callback=).*(?=&key)/)
        if (path && path.length === 1) {
          const [object, method] = path[0].split('.')
          const callback: any = window[object][method]
          // Shim authentication callback onto valid authentication params
          const shim: any = () => callback([1, null, 0, null, null, [1]])
          window[object][method] = shim
        }
      }
      if (!src.includes('QuotaService')) {
        this.setAttribute('src', value)
      }
    }
  })
}

// Authentication URL https://maps.googleapis.com/maps/api/js/AuthenticationService.Authenticate?1shttps%3A%2F%2Fexample.com&4s{{API_KEY}}&7m1&1e0&8b0&callback=_xdc_._6q5oof&key={{API_KEY}}&token=88701
// Success Response: /**/_xdc_._6q5oof && _xdc_._6q5oof( [1,null,0,null,null,[1]] )