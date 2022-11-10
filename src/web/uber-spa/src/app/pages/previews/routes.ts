import { Routes } from "@angular/router";

const routes: Routes = [
    {
        path: 'previews',
        children: [{ path: '', loadComponent: () => import('./index').then(m => m.Index) }]

    }
]

export default routes