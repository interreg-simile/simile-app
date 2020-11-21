import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NGXLogger} from 'ngx-logger';

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
    private statusBar: StatusBar,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.statusBar.backgroundColorByHexString('#000000');
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
    this.statusBar.backgroundColorByHexString(statusBarColor);

    await this.modalCtrl.dismiss(data);
  }
}
