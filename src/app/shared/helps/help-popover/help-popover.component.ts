import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {Browser} from '@capacitor/browser'

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
    private popoverCrt: PopoverController
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

        await Browser.open({ url: ref })
        return false;
      });
    }
  }
}
