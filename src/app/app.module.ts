import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {IonicStorageModule} from '@ionic/storage';
import {Network} from '@ionic-native/network/ngx';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx'

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {IModuleTranslationOptions, ModuleTranslateLoader} from '@larscom/ngx-translate-module-loader';
import {LoggerModule, NgxLoggerLevel} from 'ngx-logger';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {environment} from '../environments/environment';
import {interceptorProviders} from './shared/interceptors/interceptors';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
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
      level: !environment.production
        ? NgxLoggerLevel.DEBUG
        : NgxLoggerLevel.OFF,
      serverLogLevel: NgxLoggerLevel.OFF,
      enableSourceMaps: true,
      timestampFormat: 'short',
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Network,
    InAppBrowser,
    interceptorProviders
  ],
  bootstrap: [AppComponent]
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
    ],
  }

  return new ModuleTranslateLoader(http, opts)
}
