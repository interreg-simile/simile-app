import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router'
import {TranslateModule} from '@ngx-translate/core'

import { GlossaryPage } from './glossary.page';
import {TermModalComponent} from './term-modal/term-modal.component';

const routes: Routes = [{path: '', component: GlossaryPage}];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [GlossaryPage, TermModalComponent]
})
export class GlossaryPageModule {}
