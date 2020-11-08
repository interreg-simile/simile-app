import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {DomSanitizer} from '@angular/platform-browser';
import {NGXLogger} from 'ngx-logger';

import {statusBarColor} from '../../app.component';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss'],
})
export class PhotoViewerComponent implements OnInit {
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

  ngOnInit(): void {
    this.statusBar.backgroundColorByHexString('#000000');
  }

  async onCLoseClick(): Promise<void> {
    await this.dismiss();
  }

  async onEditClick(): Promise<void> {
    await this.dismiss({edit: true});
  }

  async onDeleteClick(): Promise<void> {
    await this.dismiss({delete: true});
  }

  async dismiss(data?): Promise<void> {
    this.statusBar.backgroundColorByHexString(statusBarColor);

    await this.modalCtrl.dismiss(data);
  }
}
