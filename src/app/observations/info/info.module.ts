import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';

import {InfoPage} from './info.page';
import {JoinDetailsPipe} from './render.pipe';

const routes: Routes = [{path: '', component: InfoPage}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [InfoPage, JoinDetailsPipe],
})
export class InfoPageModule {
}
