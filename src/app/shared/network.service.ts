import {Injectable} from '@angular/core'
import {NGXLogger} from 'ngx-logger'

import { Network } from '@capacitor/network';

import {BehaviorSubject, Observable} from 'rxjs'

import {Duration, ToastService} from './toast.service'

export enum ConnectionStatus {
  Online,
  Offline,
}

@Injectable({providedIn: 'root'})
export class NetworkService {
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

  constructor(
    private logger: NGXLogger,
    private toastService: ToastService
  ) { }

  init(): void {
    this.initializeNetworkEvents();

    Network.getStatus().then(connectionStatus => {
      const status = connectionStatus.connectionType !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    })
  }

  private initializeNetworkEvents(): void {
    Network.addListener('networkStatusChange', status => {
      if (status.connected) {
        this.logger.debug('App online');
        this.status.next(ConnectionStatus.Online);
      } else {
        this.logger.debug('App offline.');
        this.status.next(ConnectionStatus.Offline);
      }
    })
  }

  onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  checkOnlineContentAvailability(): boolean {
    if (this.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.toastService.presentToast('common.errors.offline', Duration.short);
      return false;
    }

    return true;
  }

  getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }
}
