import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu/main',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'main', loadChildren: () => import('../main/main.module').then(m => m.MainPageModule) },
      { path: 'deploy', loadChildren: () => import('../deploy/deploy.module').then(m => m.DeployPageModule) },
      { path: 'incident', loadChildren: () => import('../assistance/incident/incident.module').then(m => m.IncidentPageModule) },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
