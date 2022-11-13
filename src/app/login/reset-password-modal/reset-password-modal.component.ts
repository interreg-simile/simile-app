import { Component } from '@angular/core';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

import {Duration, ToastService} from '../../shared/toast.service';
import {NetworkService} from '../../shared/network.service';
import {AuthService} from '../../shared/auth.service';

@Component({
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.scss'],
})
export class ResetPasswordModalComponent {
  public email: string;

  constructor(
    private modalCtr: ModalController,
    private loadingCtr: LoadingController,
    private networkService: NetworkService,
    private i18n: TranslateService,
    private authService: AuthService,
    private toastService: ToastService,
  ) { }

  async onResetPasswordClick() {
    if (!this.email) {
      await this.toastService.presentToast('page-auth.resetPasswordModal.missingEmail', Duration.short);
      return;
    }

    if (!this.networkService.checkOnlineContentAvailability()) {
      return;
    }

    const loading = await this.loadingCtr.create({
      message: this.i18n.instant('common.wait'),
      showBackdrop: false,
    });

    await loading.present();

    try {
      await this.authService.sendResetPasswordEmail(this.email);
    } catch (err) {
      await loading.dismiss();

      if (err.status === 404) {
        await this.toastService.presentToast('page-auth.resetPasswordModal.notFoundError', Duration.short);
        return
      }

      await this.toastService.presentToast('common.errors.generic', Duration.short);
      return;
    }

    await loading.dismiss();
    await this.onClose();
    await this.toastService.presentToast('page-auth.resetPasswordModal.success', Duration.short);
  }

  async onClose() {
    await this.modalCtr.dismiss();
  }
}
