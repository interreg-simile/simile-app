import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {AuthorityContact} from '../observations.service';

@Component({
  selector: 'app-call-authorities',
  templateUrl: './call-authorities.component.html',
  styleUrls: ['./call-authorities.component.scss'],
})
export class CallAuthoritiesComponent {
  @Input() contact: AuthorityContact;
  @Input() callId: string;

  constructor(private modalCtr: ModalController, private inAppBrowser: InAppBrowser) { }

  onPhoneClick(tel: string) {
    this.inAppBrowser.create(`tel:${tel}`, '_system')
  }

  onUrlClick(url: string) {
    this.inAppBrowser.create(url, '_system', 'location=yes')
  }

  async onClose() {
    await this.modalCtr.dismiss();
  }
}
