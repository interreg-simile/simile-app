import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {NGXLogger} from 'ngx-logger';

import {LangService} from './shared/lang.service';

export const statusBarColor = '#00515F';
export const projectEmail = 'interreg-simile@polimi.it';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private langService: LangService,
    private logger: NGXLogger
  ) {
    this.initializeApp().then(() => {
      this.splashScreen.hide();
    });
  }

  async initializeApp() {
    await this.platform.ready()

    this.statusBar.backgroundColorByHexString(statusBarColor);
    this.statusBar.styleLightContent();

    await this.langService
      .initAppLanguage()
      .catch((err) =>
        this.logger.error('Error initializing the app language', err)
      );
    this.logger.debug('App language initialized')
  }
}
