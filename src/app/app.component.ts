import {Component, QueryList, ViewChildren} from '@angular/core'
import {
  AlertController,
  IonRouterOutlet,
  MenuController,
  ModalController,
  Platform,
  PopoverController
} from '@ionic/angular'
import {NGXLogger} from 'ngx-logger';
import {Router} from '@angular/router'

import {StatusBar} from '@capacitor/status-bar'
import {SplashScreen} from '@capacitor/splash-screen'

import {LangService} from './shared/lang.service';
import {StorageService} from './shared/storage.service';
import {NetworkService} from './shared/network.service'
import {Duration, ToastService} from './shared/toast.service'
import {FileService} from "./shared/file.service";

export const statusBarColor = '#00515F';
export const projectEmail = 'interreg-simile@polimi.it';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private _lastTimeBackPress = 0;
  private _timePeriodToExit = 2000;

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  constructor(
    private platform: Platform,
    private storageService: StorageService,
    private langService: LangService,
    private logger: NGXLogger,
    private networkService: NetworkService,
    private popoverCrt: PopoverController,
    private modalCtr: ModalController,
    private menuCtr: MenuController,
    private alertCtr: AlertController,
    private toastService: ToastService,
    private router: Router,
    private fileService: FileService,
  ) {
    this.initializeApp().then(() => {
      this.onBackButton();
      SplashScreen.hide()
      this.logger.debug('App initialized')
    });
  }

  async initializeApp() {
    await this.platform.ready()

    this.networkService.init();
    this.logger.debug('Network service initialized')

    await StatusBar.setBackgroundColor({ color: statusBarColor }).catch(_ => { /* no-op */ })

    // TODO: init notifications

    await this.storageService
      .init()
      .catch(err => this.logger.error('Error initializing storage', err))

    await this.fileService
      .createImageDir()
      .catch(err => this.logger.error('Error initializing the images directory', err));
    this.logger.debug('Images directory initialized')

    await this.langService
      .initAppLanguage()
      .catch(err => this.logger.error('Error initializing the app language', err));
    this.logger.debug('App language initialized')
  }

  onBackButton() {
    this.platform.backButton.subscribeWithPriority(1, async () => {
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

      try {
        const el = await this.menuCtr.getOpen();
        if (el) {
          await this.menuCtr.close();
          return;
        }
      } catch (err) {
      }

      try {
        const el = await this.alertCtr.getTop();
        if (el) {
          return;
        }
      } catch (err) {
      }

      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (
          this.router.url === '/map' ||
          this.router.url === '/login' ||
          !outlet.canGoBack()
        ) {
          if (new Date().getTime() - this._lastTimeBackPress < this._timePeriodToExit) {
            navigator['app'].exitApp();
          } else {
            this.toastService.presentToast(
              'common.msg-exit-app',
              Duration.short
            );
            this._lastTimeBackPress = new Date().getTime();
          }
        } else if (outlet && outlet.canGoBack()) {
          outlet.pop();
        }
      });
    });
  }
}
