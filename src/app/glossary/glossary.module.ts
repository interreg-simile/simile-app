import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';

import {GlossaryPage} from './glossary.page';
import {TermModalComponent} from './term-modal/term-modal.component';

const routes: Routes = [{path: '', component: GlossaryPage}];

@NgModule({
  entryComponents: [TermModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [GlossaryPage, TermModalComponent],
})
export class GlossaryPageModule { }
