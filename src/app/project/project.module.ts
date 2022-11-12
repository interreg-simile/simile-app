import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'
import { IonicModule } from '@ionic/angular';

import { ProjectPage } from './project.page';

const routes: Routes = [{path: '', component: ProjectPage}];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [ProjectPage]
})
export class ProjectPageModule {}
