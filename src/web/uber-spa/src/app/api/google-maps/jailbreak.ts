export default ({ poiClickHandler } = { poiClickHandler: null }) => {
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    get() {
      return this.getAttribute('src')
    },
    set(value) {
      const src: string = value.toString()
      if (src.startsWith('https://maps.googleapis.com/maps/api/js?')) {
        this.addEventListener('load', () => {
          const callback = window['google']['maps']['__gjsload__']
          const shim = (name: string, content: any) => {
            if (name === 'util') {
              content = content.toString()
              const needle = 'this.quota='
              const idx = content.indexOf(needle)
              if (idx !== -1) {
                content = content.slice(0, idx + needle.length) + 'Infinity' + content.slice(idx + needle.length + 1)
                let quotaShim: () => void
                eval('quotaShim=' + content)
                callback(name, quotaShim)
              }
            }
            // else if (name === 'common') {
            //   content = content.toString()
            //   const needle = '"&callback=_xdc_."'
            //   const idx = content.indexOf(needle)
            //   if (idx !== -1) {
            //     content = content.slice(0, idx - 3)
            //       + `
            //       if (d.indexOf(\'GeocodeService\') !== -1) {
            //         d += "&callback=_xdc_._" + (Math.random() * 100000000000).toString(36).substring(0, 6);
            //       }
            //       else {
            //         d += "&callback=_xdc_." + k;
            //       };
            //     `
            //       + content.slice(idx + needle.length + 3)

            //     console.log(content.slice(idx - 30, idx + needle.length + 300))

            //     let commonShim: () => void
            //     eval('commonShim=' + content)
            //     callback(name, commonShim)
            //   }
            // }
            else callback(name, content)
          }
          window['google']['maps']['__gjsload__'] = shim
        })
      }
      if (src.includes('ApplicationService')) {
        poiClickHandler && poiClickHandler(src.match(/(?<=!4s)[^!]*/)?.at(0))
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
      if (!src.includes('QuotaService') && !src.includes('ApplicationService')) {
        this.setAttribute('src', value)
      }
    }
  })
}

// Authentication URL https://maps.googleapis.com/maps/api/js/AuthenticationService.Authenticate?1shttps%3A%2F%2Fexample.com&4s{{API_KEY}}&7m1&1e0&8b0&callback=_xdc_._6q5oof&key={{API_KEY}}&token=88701
// Success Response: /**/_xdc_._6q5oof && _xdc_._6q5oof( [1,null,0,null,null,[1]] )