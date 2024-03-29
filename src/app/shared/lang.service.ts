import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {StorageService} from './storage.service'

@Injectable({providedIn: 'root'})
export class LangService {
  public readonly supportedLanguages = ['it', 'en'];
  public readonly defaultLanguage = 'en';

  public currLanguage: string;

  private readonly _storageKeyLanguage = 'language';

  constructor(private storageService: StorageService, private i18n: TranslateService) {}

  async initAppLanguage() {
    this.i18n.addLangs(this.supportedLanguages);
    this.i18n.setDefaultLang(this.defaultLanguage);

    await this.setAppLanguage();
  }

  private async setAppLanguage() {
    const savedLang = await this.storageService.get(this._storageKeyLanguage);

    if (savedLang && this.supportedLanguages.includes(savedLang)) {
      await this.useLanguage(savedLang);
      return;
    }

    const systemLang = this.i18n.getBrowserLang();

    if (systemLang && this.supportedLanguages.includes(systemLang)) {
      await this.useLanguage(systemLang);
      return;
    }

    await this.useLanguage(this.defaultLanguage);
  }

  async useLanguage(lang: string) {
    this.i18n.use(lang);
    await this.saveAppLanguage(lang);
    this.currLanguage = lang;
  }

  async saveAppLanguage(lang: string) {
    await this.storageService.set(this._storageKeyLanguage, lang);
  }
}
