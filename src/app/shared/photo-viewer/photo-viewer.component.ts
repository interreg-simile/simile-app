import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NGXLogger} from 'ngx-logger';

import {StatusBar} from '@capacitor/status-bar'

import {statusBarColor} from '../../app.component';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss'],
})
export class PhotoViewerComponent implements OnInit {
  public safeSrc: SafeUrl;
  public src: string;
  public delete: boolean;
  public edit: boolean;

  public slideOpts = {zoom: {maxRation: 2}};

  constructor(
    private logger: NGXLogger,
    private modalCtrl: ModalController,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    StatusBar
      .setBackgroundColor({ color: '#000000' })
      .catch(_ => {/* no-op */});
  }

  async onCLoseClick() {
    await this.dismiss();
  }

  async onEditClick() {
    await this.dismiss({edit: true});
  }

  async onDeleteClick() {
    await this.dismiss({delete: true});
  }

  async dismiss(data?) {
    await StatusBar
      .setBackgroundColor({ color: statusBarColor })
      .catch(_ => {/* no-op */});

    await this.modalCtrl.dismiss(data);
  }
}
