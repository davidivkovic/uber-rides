import { enableProdMode } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'

import { environment } from './environments/environment'
import { AppComponent } from './app/app'
import routes from './app/pages/routes'

if (environment.production) {
  enableProdMode()
}

bootstrapApplication(AppComponent, {
  providers: provideRouter(routes)
})