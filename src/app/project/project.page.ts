import { Component } from '@angular/core';

import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage {
  public projectUrl = 'https://progetti.interreg-italiasvizzera.eu/it/b/78/sistemainformativoperilmonitoraggiointegratodeilaghiinsubriciedeiloroe';

  constructor() { }

  ionViewDidEnter() {
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach((l) => l.addEventListener('click', () => this.onLinkClick(this.projectUrl)));
  }

  onLinkClick(url: string) {
    Browser.open({ url })
  }
}
