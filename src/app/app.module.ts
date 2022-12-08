import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http'
import {DatePipe, registerLocaleData} from '@angular/common'
import localeIt from '@angular/common/locales/it';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {IonicStorageModule} from '@ionic/storage-angular'
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser/ngx';
import {Geolocation} from '@awesome-cordova-plugins/geolocation/ngx';
import {Diagnostic} from '@awesome-cordova-plugins/diagnostic/ngx';
import {Camera} from '@awesome-cordova-plugins/camera/ngx';
import {File} from '@awesome-cordova-plugins/file/ngx';

import {IModuleTranslationOptions, ModuleTranslateLoader} from '@larscom/ngx-translate-module-loader'
import {TranslateLoader, TranslateModule} from '@ngx-translate/core'
import {LoggerModule, NgxLoggerLevel} from 'ngx-logger'

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {environment} from '../environments/environment'
import {PhotoViewerComponent} from './shared/photo-viewer/photo-viewer.component';
import {interceptorProviders} from './shared/interceptors/interceptors';
import {HelpPopoverComponent} from "./shared/helps/help-popover/help-popover.component";
import {HelpModalComponent} from "./shared/helps/help-modal/help-modal.component";

@NgModule({
  declarations: [
    AppComponent,
    PhotoViewerComponent,
    HelpModalComponent,
    HelpPopoverComponent
  ],
  entryComponents: [
    PhotoViewerComponent,
    HelpModalComponent,
    HelpPopoverComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoader,
        deps: [HttpClient],
      },
    }),
    LoggerModule.forRoot({
      level: !environment.production ? NgxLoggerLevel.TRACE : NgxLoggerLevel.OFF,
      serverLogLevel: NgxLoggerLevel.OFF,
      enableSourceMaps: true,
      timestampFormat: 'short',
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DatePipe,
    InAppBrowser,
    interceptorProviders,
    Geolocation,
    Diagnostic,
    Camera,
    File
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeIt, 'it');
  }
}

export function translateLoader(http: HttpClient): ModuleTranslateLoader {
  const baseTranslateUrl = './assets/i18n';

  const opts: IModuleTranslationOptions = {
    lowercaseNamespace: true,
    modules: [
      {moduleName: 'common', baseTranslateUrl},
      {moduleName: 'helps', baseTranslateUrl},
      {moduleName: 'page-map', baseTranslateUrl},
      {moduleName: 'page-new-obs', baseTranslateUrl},
      {moduleName: 'page-info-obs', baseTranslateUrl},
      {moduleName: 'page-news', baseTranslateUrl},
      {moduleName: 'page-glossary', baseTranslateUrl},
      {moduleName: 'page-project', baseTranslateUrl},
      {moduleName: 'page-settings', baseTranslateUrl},
      {moduleName: 'page-auth', baseTranslateUrl},
      {moduleName: 'page-links', baseTranslateUrl},
    ],
  }

  return new ModuleTranslateLoader(http, opts)
}
