import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {IonicModule} from '@ionic/angular';

import {LoginPage} from './login.page';
import {TranslateModule} from '@ngx-translate/core';
import {RegistrationModalComponent} from './registration-modal/registration-modal.component';
import {ConfirmEmailComponent} from './confirm-email/confirm-email.component';
import {ResetPasswordModalComponent} from './reset-password-modal/reset-password-modal.component';

const routes: Routes = [{path: '', component: LoginPage}];

@NgModule({
  entryComponents: [RegistrationModalComponent, ConfirmEmailComponent, ResetPasswordModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [LoginPage, RegistrationModalComponent, ConfirmEmailComponent, ResetPasswordModalComponent],
})
export class LoginPageModule {}
