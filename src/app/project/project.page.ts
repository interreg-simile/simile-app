import {Component} from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage {
  public projectUrl =
    'https://progetti.interreg-italiasvizzera.eu/it/b/78/sistemainformativoperilmonitoraggiointegratodeilaghiinsubriciedeiloroe';

  constructor(private inAppBrowser: InAppBrowser) { }

  ionViewDidEnter() {
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach((l) => l.addEventListener('click', () => this.onLinkClick(this.projectUrl)));
  }

  onLinkClick(url): void {
    this.inAppBrowser.create(url, '_system', 'location=yes')
  }
}
