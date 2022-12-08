import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Browser} from '@capacitor/browser'

import {PhotoViewerComponent} from '../../photo-viewer/photo-viewer.component';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelpModalComponent implements OnInit {
  public _id: string;
  public _text: string;
  public _hasImage: boolean;
  public _src: string

  constructor(
    private modalCtr: ModalController,
    private navParams: NavParams,
    private i18n: TranslateService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this._id = this.navParams.get('id');

    if (!this._id) {
      this.closeModal();
      return;
    }

    this._text = this.i18n.instant(`helps.${this._id}.text`);

    this._hasImage = this.navParams.get('hasImage');

    if (this._hasImage) { this._src = `assets/images/helps/${this._id}.jpg` }
  }

  ionViewDidEnter(): void {
    const links = document.getElementsByClassName('link');

    for (let i = 0; i < links.length; i++) {
      const ref = links[i].getAttribute('href');

      links[i].addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.cancelBubble = true;

        await Browser.open({ url: ref })
        return false;
      });
    }
  }

  async onImgClick(src: string): Promise<void> {
    const modal = await this.modalCtr.create({
      component: PhotoViewerComponent,
      componentProps: {src, edit: false, delete: false, download: true},
    });

    await modal.present();
  }

  async closeModal(): Promise<void> {
    await this.modalCtr.dismiss();
  }
}
