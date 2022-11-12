import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MapPage } from './map.page';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'

const routes: Routes = [{path: '', component: MapPage}];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [MapPage]
})
export class MapPageModule {}
