import {Component, OnInit} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {NGXLogger} from 'ngx-logger'

import {Browser} from '@capacitor/browser'

import {LangService} from '../shared/lang.service'
import {Duration, ToastService} from '../shared/toast.service'
import {NetworkService} from '../shared/network.service'
import {environment} from '../../environments/environment';
import {GenericApiResponse} from '../shared/utils.interface'

interface Link {
  id: string,
  link: string,
  name: string,
  order: number
}

@Component({
  selector: 'app-links',
  templateUrl: './links.page.html',
  styleUrls: ['./links.page.scss'],
})
export class LinksPage implements OnInit {
  public isLoading = false;
  public links: Array<Link>;

  constructor(
    private http: HttpClient,
    private i18n: LangService,
    private logger: NGXLogger,
    private toastService: ToastService,
    private networkService: NetworkService,
  ) {}

  ngOnInit() {
    this.isLoading = true

    if(!this.networkService.checkOnlineContentAvailability()) {
      this.isLoading = false
      return
    }

    this.fetchLinks()
      .catch(err => {
        this.logger.error('Error fetching links', err)
        this.toastService.presentToast('common.errors.generic', Duration.short);
      })
      .finally(() => this.isLoading = false)
  }

  async fetchLinks() {
    const url = `${environment.apiBaseUrl}/${environment.apiVersion}/misc/links`;

    const res = await this.http
      .get<GenericApiResponse>(url)
      .toPromise()
    const {data} = res

    const links: Array<Link> = []
    for(const link of data) {
      links.push({
        id: link._id,
        link: link.link,
        name: link.name[this.i18n.currLanguage] || link.name.it,
        order: link.order
      })
    }

    this.links = links
  }

  onLinkClick(url: string) {
    Browser.open({ url })
  }
}
