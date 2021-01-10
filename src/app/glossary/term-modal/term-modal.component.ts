import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

import {PhotoViewerComponent} from '../../shared/photo-viewer/photo-viewer.component';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-term-modal',
  templateUrl: './term-modal.component.html',
  styleUrls: ['./term-modal.component.scss'],
})
export class TermModalComponent implements OnInit {
  public _id: string;
  public _title: string;
  public _text: string;
  public _hasImages: boolean;
  public _imagesUrl: Array<string> = [];
  public _hasSources: boolean;
  public _sources: string;

  constructor(
    private modalCtr: ModalController,
    private navParams: NavParams,
    private i18n: TranslateService,
    private inAppBrowser: InAppBrowser,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this._id = this.navParams.get('id');

    if (!this._id) {
      this.closeModal();
      return;
    }

    this._title = this.i18n.instant(`page-glossary.${this._id}.title`);
    this._text = this.i18n.instant(`page-glossary.${this._id}.text`);

    const imgNumber = parseInt(
      this.i18n.instant(`page-glossary.${this._id}.imgCount`)
    );
    this._hasImages = imgNumber > 0;

    if (this._hasImages) {
      for (let i = 0; i < imgNumber; i++) {
        this._imagesUrl.push(`assets/images/glossary/${this._id}_${i + 1}.png`);
      }
    }

    this._sources = this.i18n.instant(`page-glossary.${this._id}.sources`);
    this._hasSources = this._sources !== `page-glossary.${this._id}.sources`;
  }

  ionViewDidEnter(): void {
    this.initTermLinks()
    this.initSourceLinks()
  }

  initTermLinks() {
    const links = document.getElementsByClassName('link');

    for (let i = 0; i < links.length; i++) {
      const ref = links[i].getAttribute('href');

      links[i].addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.cancelBubble = true;

        this.openLinkedTermModal(parseInt(ref));
        return false;
      });
    }
  }

  initSourceLinks() {
    const links = document.getElementsByClassName('source-link');

    for (let i = 0; i < links.length; i++) {
      const ref = links[i].getAttribute('href');

      links[i].addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.cancelBubble = true;

        this.inAppBrowser.create(ref, '_system', 'location=yes')
        return false;
      });
    }
  }

  async openLinkedTermModal(idx: number): Promise<void> {
    const modal = await this.modalCtr.create({
      component: TermModalComponent,
      componentProps: {id: idx},
    });

    await modal.present();
  }

  async onImgClick(src: string): Promise<void> {
    const modal = await this.modalCtr.create({
      component: PhotoViewerComponent,
      componentProps: {src, edit: false, delete: false, download: false},
    });

    await modal.present();
  }

  async closeModal(): Promise<void> {
    await this.modalCtr.dismiss();
  }
}
