import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GlossaryPage } from './glossary.page';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'

const routes: Routes = [{path: '', component: GlossaryPage}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [GlossaryPage]
})
export class GlossaryPageModule {}
