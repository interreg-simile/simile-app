import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {IonicModule} from '@ionic/angular';

import {LinksPage} from './links.page';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [{path: '', component: LinksPage}];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [LinksPage]
})
export class LinksPageModule {}
