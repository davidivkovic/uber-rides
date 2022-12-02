import { enableProdMode } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter, RouteReuseStrategy } from '@angular/router'

import { environment } from './environments/environment'
import { AppComponent } from './app/app'
import { CustomReuseStrategy } from './app/utils'
import routes from './app/pages/routes'

if (environment.production) {
  enableProdMode()
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideRouter(routes)
  ]
})