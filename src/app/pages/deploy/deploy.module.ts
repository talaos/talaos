import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DeployPage } from './deploy.page';
import { DeployModal } from "../../modals/forms/deploy/deploy.modal";

const routes: Routes = [
  {
    path: '',
    component: DeployPage
  }
];

@NgModule({
  entryComponents: [DeployModal],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [DeployPage, DeployModal]
})
export class DeployPageModule {}
