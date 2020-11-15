import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
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

  constructor(
    private modalCtr: ModalController,
    private navParams: NavParams,
    private i18n: TranslateService
  ) { }

  ngOnInit(): void {
    this._id = this.navParams.get('id');

    if (!this._id) {
      this.closeModal();
      return;
    }

    this._text = this.i18n.instant(`helps.${this._id}.text`);

    this._hasImage = this.navParams.get('hasImage');
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
