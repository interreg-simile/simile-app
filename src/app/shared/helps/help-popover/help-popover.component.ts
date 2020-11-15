import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-help-popover',
  templateUrl: './help-popover.component.html',
  styleUrls: ['./help-popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelpPopoverComponent implements OnInit {
  public _text: string;

  constructor(
    private navParams: NavParams,
    private popoverCrt: PopoverController,
    private inAppBrowser: InAppBrowser
  ) { }

  ngOnInit(): void {
    this._text = this.navParams.get('text');

    if (!this._text) {
      this.popoverCrt.dismiss();
    }
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

        this.inAppBrowser.create(ref, '_system', 'location=yes')
        return false;
      });
    }
  }
}
