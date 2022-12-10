import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle, UrlSegment } from '@angular/router'

export class CustomReuseStrategy implements RouteReuseStrategy {

  storedHandles: { [key: string]: DetachedRouteHandle } = {}
  fullRoute: string

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['reuseRoute'] || false
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const id = this.createIdentifier(route)
    const fullRoute = route.url.map(s => s.path).join('/')
    if (fullRoute !== '' && handle) this.fullRoute = fullRoute
    if (handle) {
      (handle as any)?.componentRef?.instance?.onDeactivated?.()
    } else {
      (this.storedHandles?.[id] as any)?.componentRef?.instance?.onActivated?.(this.fullRoute)
    }
    if (route.data['reuseRoute']) {
      this.storedHandles[id] = handle
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const id = this.createIdentifier(route)
    const handle = this.storedHandles[id]
    const canAttach = !!route.routeConfig && !!handle
    return canAttach
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const id = this.createIdentifier(route)
    if (!route.routeConfig || !this.storedHandles[id]) return null
    return this.storedHandles[id]
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig
  }

  private createIdentifier(route: ActivatedRouteSnapshot) {
    // Build the complete path from the root to the input route
    const segments: UrlSegment[][] = route.pathFromRoot.map(r => r.url)
    const subpaths = ([] as UrlSegment[]).concat(...segments).map(segment => segment.path)
    // Result: ${route_depth}-${path}
    return segments.length + '-' + subpaths.join('/')
  }
}