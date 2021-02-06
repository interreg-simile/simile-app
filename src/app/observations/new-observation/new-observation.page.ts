import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  ActionSheetController, AlertController, LoadingController, ModalController, NavController,
  PickerController, Platform, PopoverController
} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import {Subscription} from 'rxjs';

import {AuthorityContact, MinimalObservation, ObservationsService} from '../observations.service';
import {PhotoViewerComponent} from '../../shared/photo-viewer/photo-viewer.component';
import {CameraService, PicResult} from '../../shared/camera.service';
import {Duration, ToastService} from '../../shared/toast.service';
import {MeasuresImpl} from '../observation.model';
import {HubComponent} from '../measures/hub/hub.component';

import {HelpsService} from '../../shared/helps/helps.service';
import {ConnectionStatus, NetworkService} from '../../shared/network.service';
import {CallAuthoritiesComponent} from '../call-authorities/call-authorities.component';
import {Events} from '../../shared/events.service';
import {SafeUrl} from '@angular/platform-browser';
import {AuthService} from '../../shared/auth.service';

@Component({
  selector: 'app-new-observation',
  templateUrl: './new-observation.page.html',
  styleUrls: ['./new-observation.page.scss'],
})
export class NewObservationPage implements OnInit, OnDestroy {
  private _backButtonSub: Subscription;

  public _isLoading = true;
  public _isWeatherLoading = false;

  public _newObservation: any;
  public _authorityContact: AuthorityContact;

  public skyIcons = {
    1: 'wi-day-sunny',
    2: 'wi-day-cloudy',
    3: 'wi-cloudy',
    4: 'wi-rain',
    5: 'wi-snowflake-cold',
    6: 'wi-windy',
  };

  public _imageSrc: Array<SafeUrl> = [undefined, undefined, undefined];

  originalOrder = (a, b) => 0;

  constructor(
    private router: Router,
    private navCtr: NavController,
    private obsService: ObservationsService,
    private alertCtr: AlertController,
    private loadingCtr: LoadingController,
    private pickerCtr: PickerController,
    private modalCtr: ModalController,
    private i18n: TranslateService,
    private cameraService: CameraService,
    private toastService: ToastService,
    private platform: Platform,
    private logger: NGXLogger,
    private events: Events,
    public helpsService: HelpsService,
    public networkService: NetworkService,
    private popoverCrt: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    public authService: AuthService
  ) { }

  ngOnInit() {
    if (!this.obsService.newObservation) {
      this.navCtr.navigateBack('/map');
      return;
    }

    this._newObservation = this.obsService.newObservation;
    this._imageSrc[0] = this.cameraService.getImgSrc(this._newObservation.photos[0]);

    this.getWeatherData(false)
      .catch(() => this.toastService.presentToast('page-map.msg-weather-error', Duration.short))
      .finally(() => {
        this.getAuthorityContact()
          .finally(() => (this._isLoading = false));
      })

    this._backButtonSub = this.platform.backButton.subscribeWithPriority(999, () => this.onClose());
  }

  async getWeatherData(showErr: boolean) {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return;
    }

    const [data, err] = await this.obsService
      .getWeatherData(this._newObservation.position.coordinates)
      .then((v) => [v, undefined])
      .catch((e) => [undefined, e]);

    if (err === undefined && data !== undefined) {
      this._newObservation.weather.temperature = Math.round(data.temperature * 10) / 10;
      this._newObservation.weather.sky.code = data.sky;
      this._newObservation.weather.wind = Math.round(data.wind * 10) / 10;
      return;
    }

    if (showErr) {
      await this.toastService.presentToast(
        'page-new-obs.weather.err',
        Duration.short
      );
    }
  }

  async getAuthorityContact() {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline || !this._newObservation.position.area) {
      return;
    }

    const [data, err] = await this.obsService
      .getAuthorityContact(this._newObservation.position.area)
      .then((v) => [v, undefined])
      .catch((e) => {
        this.logger.error('Error fetching authority contacts', e)
        return [undefined, e]
      });

    if (data) {
      this._authorityContact = data
      return
    }
  }

  async onRefreshWeatherClick() {
    if (!this.networkService.checkOnlineContentAvailability()) {
      return;
    }

    this._isWeatherLoading = true;

    await this.getWeatherData(true);

    this._isWeatherLoading = false;
  }

  async onWeatherClick(name: 'temperature' | 'wind') {
    const alert = await this.alertCtr.create({
      subHeader: this.i18n.instant(`page-new-obs.weather.${name}-head`),
      backdropDismiss: false,
      inputs: [
        {
          name: 'data',
          type: 'number',
          placeholder: this.i18n.instant(`page-new-obs.weather.${name}-ph`),
          value: this._newObservation.weather[name],
        },
      ],
      buttons: [
        {text: this.i18n.instant('common.alerts.btn-cancel'), role: 'cancel'},
        {
          text: this.i18n.instant('common.alerts.btn-ok'),
          handler: (data) => {
            if (data.data) {
              this._newObservation.weather[name] = data.data;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async onSkyClick() {
    const getOpts = () => {
      const opts = [];

      for (let i = 1; i < 7; i++) {
        opts.push({
          text: this.i18n.instant(`page-new-obs.weather.sky.${i}`),
          value: i,
        });
      }

      return opts;
    };

    const picker = await this.pickerCtr.create({
      columns: [
        {
          name: 'data',
          options: getOpts(),
          selectedIndex: this._newObservation.weather.sky.code - 1,
        },
      ],
      buttons: [
        {text: this.i18n.instant('common.alerts.btn-cancel'), role: 'cancel'},
        {
          text: this.i18n.instant('common.alerts.btn-confirm'),
          handler: (data) =>
            (this._newObservation.weather.sky.code = data.data.value),
        },
      ],
    });

    await picker.present();
  }

  async onDetailCheckboxClick(e: MouseEvent, detail: any) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.stopPropagation();

    if (!detail.checked) {
      await this.openDetailModal(detail.component);
    } else {
      detail.checked = false;
    }
  }

  async onDetailLabelClick(e: MouseEvent, component: any) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.stopPropagation();

    await this.openDetailModal(component);
  }

  async openDetailModal(component: any) {
    const modal = await this.modalCtr.create({component});

    await modal.present();
  }

  async onMeasuresCheckboxClick(e: MouseEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.stopPropagation();

    if (!this.obsService.newObservation.measures || !this._newObservation.measures.checked) {
      await this.openMeasuresModal();
    } else {
      this._newObservation.measures.checked = false;
    }
  }

  async onMeasuresLabelClick(e: MouseEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.stopPropagation();

    await this.openMeasuresModal();
  }

  async openMeasuresModal() {
    if (!this.obsService.newObservation.measures) {
      this.obsService.newObservation.measures = new MeasuresImpl();
    }

    const measuresModal = await this.modalCtr.create({
      component: HubComponent,
    });
    await measuresModal.present();
  }

  async onThumbnailClick(src: SafeUrl, idx: number) {
    if (!src) {
      await this.presentPhotoChoice(idx);
      return;
    }

    const modal = await this.modalCtr.create({
      component: PhotoViewerComponent,
      componentProps: {safeSrc: src, edit: true, delete: true},
    });

    await modal.present();

    const data = await modal.onDidDismiss();

    if (!data.data) {
      return;
    }

    if (data.data.edit) {
      await this.presentPhotoChoice(idx);
    } else if (data.data.delete) {
      this._newObservation.photos[idx] = undefined;
      this._imageSrc[idx] = undefined;
    }
  }

  async presentPhotoChoice(idx: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.i18n.instant('page-new-obs.photo-choice.header'),
      buttons: [
        {
          text: this.i18n.instant('page-new-obs.photo-choice.btn-camera'),
          handler: async () => {
            await this.takePhoto(idx, false);
            return null;
          },
        },
        {
          text: this.i18n.instant('page-new-obs.photo-choice.btn-gallery'),
          handler: async () => {
            await this.takePhoto(idx, true);
            return null;
          },
        },
        {
          text: this.i18n.instant('page-new-obs.photo-choice.btn-close'),
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async takePhoto(idx: number, fromGallery: boolean) {
    const pic = await this.cameraService.takePicture(fromGallery);

    if (pic === PicResult.ERROR) {
      await this.toastService.presentToast('common.errors.photo', Duration.short);
      return;
    }

    if (pic === PicResult.NO_IMAGE || pic === undefined) { return }

    this._newObservation.photos[idx] = pic;

    this._imageSrc[idx] = this.cameraService.getImgSrc(this._newObservation.photos[idx]);
  }

  async onSendClick() {
    const loading = await this.loadingCtr.create({
      message: this.i18n.instant('common.wait'),
      showBackdrop: false,
    });

    await loading.present();

    const [res, err] = await this.obsService
      .postObservation()
      .then((v) => [v, undefined])
      .catch((error) => [undefined, error]);

    await loading.dismiss();

    if (err) {
      this.logger.error('Error posting the observation.', err);
      await this.toastService.presentToast(
        'page-new-obs.err-msg',
        Duration.short
      );
      return;
    }

    if (res === 'online') {
      this.events.publish('observation:inserted-online');
    } else if (res === 'offline') {
      this.events.publish('observation:inserted-offline');
    }

    await this.router.navigate(['map']);
  }

  async onCallAuthoritiesClick() {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      await this.toastService.presentToast('common.errors.offline-function', Duration.short);
      return;
    }

    if (!this._authorityContact) {
      await this.toastService.presentToast('page-new-obs.call-no-roi-msg', Duration.short);
      return;
    }

    const loading = await this.loadingCtr.create({
      message: this.i18n.instant('common.wait'),
      showBackdrop: false,
    });

    await loading.present();

    const [res, err] = await this.obsService
      .postObservationWithCall()
      .then((v) => [v, undefined])
      .catch((error) => [undefined, error]);

    await loading.dismiss();

    if (err) {
      this.logger.error('Error posting the observation.', err);
      await this.toastService.presentToast('page-new-obs.err-msg', Duration.short);
      return;
    }

    this.events.publish('observation:inserted-online');

    const obs = res as MinimalObservation;

    if (!obs.position.roi || !obs.position.area || !obs.callId) {
      await this.toastService.presentToast('page-new-obs.call-data-error', Duration.short);
      await this.router.navigate(['map']);
      return;
    }

    const modal = await this.modalCtr.create({
      component: CallAuthoritiesComponent,
      cssClass: 'auto-height',
      backdropDismiss: false,
      componentProps: {
        contact: this._authorityContact,
        callId: obs.callId,
      },
    });

    await modal.present();

    await modal.onDidDismiss();

    await this.router.navigate(['map']);
  }

  async onClose() {
    try {
      const el = await this.popoverCrt.getTop();
      if (el) {
        await el.dismiss();
        return;
      }
    } catch (err) {
    }

    try {
      const el = await this.modalCtr.getTop();
      if (el) {
        await el.dismiss();
        return;
      }
    } catch (err) {
    }

    const alert = await this.alertCtr.create({
      message: this.i18n.instant('page-new-obs.alert-message-cancel'),
      buttons: [
        {
          text: this.i18n.instant('page-new-obs.alert-btn-cancel'),
          handler: () => this.router.navigate(['map']),
        },
        {
          text: this.i18n.instant('page-new-obs.alert-btn-continue'),
          role: 'cancel',
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this._backButtonSub && !this._backButtonSub.closed) {
      this._backButtonSub.unsubscribe();
    }

    this.obsService.resetNewObservation();
  }
}
