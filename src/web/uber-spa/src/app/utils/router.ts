import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle, UrlSegment } from '@angular/router'
import { userStore } from '@app/stores'

export class CustomReuseStrategy implements RouteReuseStrategy {

  userId: number | undefined = userStore?.user?.id
  storedHandles: { [key: string]: DetachedRouteHandle } = {}
  fullRoute: string

  getHandle(key: string) {
    if (this.userId !== userStore?.user?.id) {
      this.userId = userStore?.user?.id
      this.storedHandles = {}
    }
    return this.storedHandles?.[key]
  }

  setHandle(key: string, handle: DetachedRouteHandle) {
    if (this.userId !== userStore?.user?.id) {
      this.userId = userStore?.user?.id
      this.storedHandles = {}
    }
    this.storedHandles[key] = handle
  }

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
      (this.getHandle(id) as any)?.componentRef?.instance?.onActivated?.(this.fullRoute)
    }
    if (route.data['reuseRoute']) {
      this.setHandle(id, handle)
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const id = this.createIdentifier(route)
    const handle = this.getHandle(id)
    const canAttach = !!route.routeConfig && !!handle
    return canAttach
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const id = this.createIdentifier(route)
    if (!route.routeConfig || !this.getHandle(id)) return null
    return this.getHandle(id)
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