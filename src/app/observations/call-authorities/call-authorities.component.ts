import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-call-authorities',
  templateUrl: './call-authorities.component.html',
  styleUrls: ['./call-authorities.component.scss'],
})
export class CallAuthoritiesComponent {
  @Input() area: number;
  @Input() callId: string;

  contacts = {
    1: '800.061.160',
    2: '',
    3:'https://www4.ti.ch/dt/da/spaas/sezione/'
  };

  constructor(private modalCtr: ModalController, private inAppBrowser: InAppBrowser) { }

  onTelClick(tel: string) {
    this.inAppBrowser.create(`tel:${tel}`, '_system')
  }

  onUrlClick(url: string) {
    this.inAppBrowser.create(url, '_system', 'location=yes')
  }

  async onClose() {
    await this.modalCtr.dismiss();
  }
}
