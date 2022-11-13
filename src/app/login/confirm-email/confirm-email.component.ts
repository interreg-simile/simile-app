import {Component, Input} from '@angular/core';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

import {NetworkService} from '../../shared/network.service';
import {Duration, ToastService} from '../../shared/toast.service';
import {AuthService} from '../../shared/auth.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent {
  @Input() email: string;

  constructor(
    private modalCtr: ModalController,
    private loadingCtr: LoadingController,
    private networkService: NetworkService,
    private i18n: TranslateService,
    private authService: AuthService,
    private toastService: ToastService,
  ) { }

  async onSendEmailClick() {
    if (!this.networkService.checkOnlineContentAvailability()) {
      return;
    }

    const loading = await this.loadingCtr.create({
      message: this.i18n.instant('common.wait'),
      showBackdrop: false,
    });

    await loading.present();

    try {
      await this.authService.sendConfirmationEmail(this.email);
    } catch (err) {
      await loading.dismiss();

      if (err.status === 404) {
        await this.toastService.presentToast('page-auth.emailNotVerifiedModal.notFoundError', Duration.short);
        return
      }

      if (err.status === 409) {
        await this.toastService.presentToast('page-auth.emailNotVerifiedModal.alreadyVerifiedError', Duration.short);
        return
      }

      await this.toastService.presentToast('common.errors.generic', Duration.short);
      return;
    }

    await loading.dismiss();
    await this.onClose();
    await this.toastService.presentToast('page-auth.emailNotVerifiedModal.success', Duration.short);
  }

  async onClose() {
    await this.modalCtr.dismiss();
  }
}
