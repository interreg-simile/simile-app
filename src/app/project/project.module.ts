import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ProjectPage } from './project.page';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'

const routes: Routes = [{path: '', component: ProjectPage}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [ProjectPage]
})
export class ProjectPageModule {}
