import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'

import {AlertsComponent} from './alerts/alerts.component';
import {EventsComponent} from './events/events.component';
import { NewsPage } from './news.page';

const routes: Routes = [{path: '', component: NewsPage}];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [NewsPage, AlertsComponent, EventsComponent]
})
export class NewsPageModule {}
