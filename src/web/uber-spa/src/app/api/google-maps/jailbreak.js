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
      else if (
        !src.includes('AuthenticationService') &&
        !src.includes('QuotaService')
      ) {
        this.setAttribute('src', value)
      }
    }
  })
}