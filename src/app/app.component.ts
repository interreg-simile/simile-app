import { Component } from '@angular/core';
import {Platform} from '@ionic/angular';
import {NGXLogger} from 'ngx-logger';

import {LangService} from './shared/lang.service';
import {StorageService} from './shared/storage.service';

export const statusBarColor = '#00515F';
export const projectEmail = 'interreg-simile@polimi.it';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private storageService: StorageService,
    private langService: LangService,
    private logger: NGXLogger,
  ) {
    this.initializeApp().then(() => {
      this.logger.info('App initialized!')
    });
  }

  async initializeApp() {
    await this.platform.ready()

    await this.storageService
      .init()
      .catch(err => this.logger.error('Error initializing storage', err))

    await this.langService
      .initAppLanguage()
      .catch(err => this.logger.error('Error initializing the app language', err));
    this.logger.debug('App language initialized')
  }
}
