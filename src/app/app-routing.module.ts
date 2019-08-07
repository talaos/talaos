import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuPageModule) },
  { path: 'deploydetails/:id', loadChildren: () => import('./pages/deploydetails/deploydetails.module')
    .then(m => m.DeploydetailsPageModule) },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
