import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AlertController, LoadingController, Platform, PopoverController} from '@ionic/angular';
import {Circle, LatLng, LeafletMouseEvent, Map, Marker, TileLayer} from 'leaflet';
import {MarkerClusterGroup} from 'leaflet.markercluster';
import {Subscription} from 'rxjs';
import {Storage} from '@ionic/storage';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {NGXLogger} from 'ngx-logger';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import * as moment from 'moment';

import {Events} from '../shared/events.service';
import {MapService} from './map.service';
import {customMarkerIcon, userMarkerIcon} from '../shared/markers';
import {LocationErrors} from '../shared/common.enum';
import {NewsService} from '../news/news.service';
import {ObservationsService} from '../observations/observations.service';
import {CameraService, PicResult} from '../shared/camera.service';
import {Observation} from '../observations/observation.model';
import {Duration, ToastService} from '../shared/toast.service';
import {LegendComponent, Markers} from './legend/legend.component';
import {ConnectionStatus, NetworkService} from '../shared/network.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  private readonly _storageKeyPosition = 'position';

  private readonly _onlineUrlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly _offlineUrlTemplate = 'assets/tiles/{z}/{x}/{y}.png';

  private readonly _initialLatLon = new LatLng(45.95388572325957, 8.958533937111497);

  private readonly _initialZoomLvl = 9;
  private readonly _defaultZoomLvl = 16;
  private readonly _minZoomLvl = 14;
  private readonly _offlineZoomLvl = 12;

  private _positionSub: Subscription;
  private _pauseSub: Subscription;
  private _networkSub: Subscription;
  private _eventsSub: Subscription;
  private _alertsSub: Subscription;
  private _obsSub: Subscription;
  private _newEventsSub: Subscription;
  private _newAlertsSub: Subscription;

  private loading: HTMLIonLoadingElement;
  private _map: Map;
  private _onlineBaseMap: TileLayer;
  private _offlineBaseMap: TileLayer;
  private _userMarker: Marker;
  private _accuracyCircle: Circle;
  private _customMarker: Marker;
  private _isFirstPosition = true;

  private _coords: LatLng;
  private _accuracy: number;

  private _savedMapCenter: LatLng;
  private _savedZoomLevel: number;

  public _isLoading = false;
  private _hasFetchedData = false;
  private _isFetchDataError = false;

  public _isMapFollowing = false;
  public _locationErrors = LocationErrors;
  public _locationStatus = LocationErrors.NO_ERROR;

  public _isAppOffline = false;
  public _isOfflineBasemapActive = false;
  private _restoreOfflineBasemap = false;

  private _eventMarkers: MarkerClusterGroup;
  private _alertMarkers: MarkerClusterGroup;
  private _obsMarkers: MarkerClusterGroup;
  private _userObsMarkers: MarkerClusterGroup;

  public _areNewEvents: boolean;
  public _areNewAlerts: boolean;

  constructor(
    private logger: NGXLogger,
    private router: Router,
    private i18n: TranslateService,
    private changeRef: ChangeDetectorRef,
    private platform: Platform,
    private mapService: MapService,
    private obsService: ObservationsService,
    private cameraService: CameraService,
    private diagnostic: Diagnostic,
    private storage: Storage,
    private newsService: NewsService,
    private loadingCtr: LoadingController,
    private alertCtr: AlertController,
    private toastService: ToastService,
    private popoverCtr: PopoverController,
    private events: Events,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    this._pauseSub = this.platform.pause.subscribe(() => {
      this.cachePosition().catch((err) =>
        this.logger.error('Error caching position', err)
      );
    });

    this.diagnostic.registerLocationStateChangeHandler(state => this.onLocationChange(state));

    this.events.subscribe('popover:change', data => this.onPopoverChange(data.marker, data.checked));

    this.events.subscribe('observation:inserted-online', () => (this._customMarker = null));

    this.events.subscribe('observation:inserted-offline', () => {
        this.toastService.presentToast('page-map.msg-saved-offline', Duration.short);
        this._customMarker = null;
      });

    this.initMarkerClusters();

    this._eventsSub = this.newsService.events.subscribe(events => {
      this._eventMarkers.clearLayers();
      events.forEach((e) => {
        if (e.coordinates) {
          this.mapService.createEventMarker(e).addTo(this._eventMarkers);
        }
      });
    });

    this._alertsSub = this.newsService.alerts.subscribe(alerts => {
      this._alertMarkers.clearLayers();
      alerts.forEach((a) => {
        if (a.coordinates) {
          this.mapService.createAlertMarker(a).addTo(this._alertMarkers);
        }
      });
    });

    this._obsSub = this.obsService.observations.subscribe(obs => {
      this._obsMarkers.clearLayers();
      this._userObsMarkers.clearLayers();
      obs.forEach((o) => {
        if (moment.utc(o.createdAt).isBefore(moment.utc().subtract(9, 'months'))) {
          return
        }

        const marker: Marker = this.mapService.createObservationMarker(o);
        if (marker.options['isPersonal']) {
          marker.addTo(this._userObsMarkers);
        } else {
          marker.addTo(this._obsMarkers);
        }
      });
    });

    this._newEventsSub = this.newsService.areNewEvents.subscribe(v => (this._areNewEvents = v));
    this._newAlertsSub = this.newsService.areNewAlerts.subscribe(v => (this._areNewAlerts = v));
  }

  ionViewDidEnter() {
    this.initMap()
      .then(() => {
        if (this._isAppOffline && this._restoreOfflineBasemap) {
          this.setOfflineBasemap();
        }

        this.startWatcher()
          .catch(err => this.logger.error('Error starting watcher for the first time', err));

        this.subscribeNetworkChanges();
      });
  }

  private onLocationChange(state) {
    this.logger.debug('Location state changed', state)

    const androidOffCondition = this.platform.is('android') && state === this.diagnostic.locationMode.LOCATION_OFF
    const iosOffCondition = this.platform.is('ios') &&
      state !== this.diagnostic.permissionStatus.GRANTED &&
      state !== this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE

    if (androidOffCondition || iosOffCondition) {
      this.stopWatcher();
      return
    }

    this.startWatcher()
      .catch(err => this.logger.error('Error starting the watcher', err));
  }

  private subscribeNetworkChanges() {
    if (this._networkSub) {
      return;
    }

    this._networkSub = this.networkService
      .onNetworkChange()
      .subscribe((status) => {
        this._isAppOffline = status === ConnectionStatus.Offline;
        this.changeRef.detectChanges();

        if (status === ConnectionStatus.Online) {
          this.setOnlineBasemap();
          this.handleMapData().finally(() => this.changeRef.detectChanges());
          return;
        }

        this.toastService.presentToast('common.errors.offline', Duration.short);
      });
  }

  private initMarkerClusters() {
    this._eventMarkers = new MarkerClusterGroup({
      iconCreateFunction: (cluster) => {
        const icon = this._eventMarkers._defaultIconCreateFunction(cluster);
        icon.options.className = 'marker-cluster marker-cluster-events';
        return icon;
      },
    });

    this._eventMarkers.on('clusterclick', () => {
      if (this._isAppOffline) {
        this.toastService.presentToast('common.errors.offline', Duration.short);
      }
    });

    this._alertMarkers = new MarkerClusterGroup({
      iconCreateFunction: (cluster) => {
        const icon = this._alertMarkers._defaultIconCreateFunction(cluster);
        icon.options.className = 'marker-cluster marker-cluster-alerts';
        return icon;
      },
    });

    this._alertMarkers.on('clusterclick', () => {
      if (this._isAppOffline) {
        this.toastService.presentToast('common.errors.offline', Duration.short);
      }
    });

    this._obsMarkers = new MarkerClusterGroup({
      iconCreateFunction: (cluster) => {
        const icon = this._obsMarkers._defaultIconCreateFunction(cluster);
        icon.options.className = 'marker-cluster marker-cluster-obs';
        return icon;
      },
    });

    this._obsMarkers.on('clusterclick', () => {
      if (this._isAppOffline) {
        this.toastService.presentToast('common.errors.offline', Duration.short);
      }
    });

    this._userObsMarkers = new MarkerClusterGroup({
      iconCreateFunction: (cluster) => {
        const icon = this._userObsMarkers._defaultIconCreateFunction(cluster);
        icon.options.className = 'marker-cluster marker-cluster-user-obs';
        return icon;
      },
    });

    this._userObsMarkers.on('clusterclick', () => {
      if (this._isAppOffline) {
        this.toastService.presentToast('common.errors.offline', Duration.short);
      }
    });
  }

  private async initMap() {
    if (!this._savedMapCenter) {
      const cachedCoords = (await this.storage.get(this._storageKeyPosition)) as Array<number>;

      if (cachedCoords) {
        this._savedMapCenter = new LatLng(cachedCoords[0], cachedCoords[1]);
        this._savedZoomLevel = this._defaultZoomLvl;
      } else {
        this._savedMapCenter = this._initialLatLon;
        this._savedZoomLevel = this._initialZoomLvl;
      }
    }

    this._map = new Map('map', {zoomControl: false, tap: true});

    this._map.setView(this._savedMapCenter, this._savedZoomLevel);

    this._offlineBaseMap = new TileLayer(this._offlineUrlTemplate, {
      attribution: '&copy; OpenStreetMap contributors',
      minZoom: this._offlineZoomLvl,
      maxZoom: this._offlineZoomLvl,
    });

    this._onlineBaseMap = new TileLayer(this._onlineUrlTemplate, {
      attribution: '&copy; OpenStreetMap contributors',
      minZoom: 0,
      maxZoom: 18,
    }).addTo(this._map);

    this._eventMarkers.addTo(this._map);
    this._alertMarkers.addTo(this._map);
    this._obsMarkers.addTo(this._map);
    this._userObsMarkers.addTo(this._map);

    if (this._userMarker) {
      this._userMarker.addTo(this._map);
    }
    if (this._accuracyCircle) {
      this._accuracyCircle.addTo(this._map);
    }
    if (this._customMarker) {
      this._customMarker.addTo(this._map);
    }

    this._map.on('dragstart', () => (this._isMapFollowing = false));

    // Fired when the user taps on the map for more than one second
    this._map.on('contextmenu', (ev: LeafletMouseEvent) => {
      if (this.platform.is('ios')) {
        this.logger.debug('iOS detected, changing map long click behaviour')
        return;
      }

      if (!this._customMarker) {
        this._customMarker = new Marker(ev.latlng, {icon: customMarkerIcon()}).addTo(this._map);
      } else {
        this._customMarker.setLatLng(ev.latlng);
      }

      this._map.panTo(ev.latlng);
      this._isMapFollowing = false;
    });

    this._map.on('click', (ev: LeafletMouseEvent) => {
      if (this.platform.is('ios')) {
        this.logger.debug('iOS detected, changing map click behaviour')

        if (!this._customMarker) {
          this._customMarker = new Marker(ev.latlng, {icon: customMarkerIcon()}).addTo(this._map);
          this._map.panTo(ev.latlng);
          this._isMapFollowing = false;
          return;
        }

        this._map.removeLayer(this._customMarker);
        this._customMarker = null;

        return
      }

      if (!this._customMarker) {
        return;
      }

      this._map.removeLayer(this._customMarker);
      this._customMarker = null;
    });
  }

  private async startWatcher(fromClick = false) {
    if (this._positionSub) {
      return;
    }

    this._locationStatus = await this.mapService.checkPositionAvailability(fromClick);
    this.changeRef.detectChanges();

    if (this._locationStatus !== LocationErrors.NO_ERROR) { return }

    this._isMapFollowing = true;
    this.changeRef.detectChanges();

    this._positionSub = this.mapService
      .watchLocation()
      .subscribe((data) => this.onPositionReceived(data));
  }

  private stopWatcher() {
    if (this._positionSub) {
      this._positionSub.unsubscribe();
      this._positionSub = null;
    }

    this._locationStatus = LocationErrors.GPS_ERROR;
    this.changeRef.detectChanges();

    if (this._userMarker) {
      this._map.removeLayer(this._userMarker);
      this._userMarker = null;
    }

    if (this._accuracyCircle) {
      this._map.removeLayer(this._accuracyCircle);
      this._accuracyCircle = null;
    }

    this._isMapFollowing = false;
    this.changeRef.detectChanges();

    this.cachePosition()
      .catch(err => this.logger.error('Error caching the position.', err));
  }

  private onPositionReceived(data: any) {
    if (!data.coords) {
      this.logger.error(
        'Error form the data emitted by the position watcher.',
        data
      );
      return;
    }

    if (!this._coords) {
      this._coords = new LatLng(data.coords.latitude, data.coords.longitude);
    } else {
      this._coords.lat = data.coords.latitude;
      this._coords.lng = data.coords.longitude;
    }

    this._accuracy = data.coords.accuracy;

    if (this._map && this._isMapFollowing) {
      if (this._isFirstPosition) {
        this._map.setView(this._coords, this._defaultZoomLvl);
        this._isFirstPosition = false;
      } else {
        this._map.panTo(this._coords);
      }
    }

    if (!this._userMarker) {
      this.createUserMarker(this._coords);
    } else {
      this._userMarker.setLatLng(this._coords);
      this._accuracyCircle
        .setLatLng(this._coords)
        .setRadius(this._accuracy / 2);
    }
  }

  private createUserMarker(latLng: LatLng) {
    this._userMarker = new Marker(latLng, {
      icon: userMarkerIcon(),
      zIndexOffset: 3,
    }).addTo(this._map);

    this._accuracyCircle = new Circle(latLng, {
      radius: 0,
      opacity: 0.5,
    }).addTo(this._map);
  }

  onOfflineClick() {
    if (this._isOfflineBasemapActive) {
      this.setOnlineBasemap();
    } else {
      this.setOfflineBasemap();
    }
  }

  private setOfflineBasemap() {
    if (this._isOfflineBasemapActive && !this._restoreOfflineBasemap) {
      return;
    }

    this._offlineBaseMap.addTo(this._map);
    this._onlineBaseMap.remove();

    this._map.setZoom(this._offlineZoomLvl);

    this._isOfflineBasemapActive = true;
    this._restoreOfflineBasemap = true;
  }

  private setOnlineBasemap() {
    if (!this._isOfflineBasemapActive) {
      return;
    }

    this._onlineBaseMap.addTo(this._map);

    this._offlineBaseMap.remove();

    this._isOfflineBasemapActive = false;
    this._restoreOfflineBasemap = false;
  }

  onGPSClick() {
    if (this._customMarker) {
      this._map.removeLayer(this._customMarker);
      this._customMarker = null;
    }

    this.logger.debug('GPS clicked. Location status', this._locationStatus)

    if (this._locationStatus !== LocationErrors.NO_ERROR) {
      this.startWatcher(true).catch(err => this.logger.error('Error starting the position watcher.', err));
      return;
    }

    if (!this._isMapFollowing) {
      if (this._map.getZoom() < this._minZoomLvl) {
        this._map.flyTo(this._coords, this._defaultZoomLvl, {animate: false});
      } else {
        this._map.panTo(this._coords, {animate: true});
      }

      this._isMapFollowing = true;

      return;
    }

    this._map.setZoom(this._defaultZoomLvl, {animate: true});
  }

  async onSyncClick() {
    if (!this.networkService.checkOnlineContentAvailability()) {
      return;
    }

    if (this._isLoading) {
      return;
    }

    this._hasFetchedData = false;

    this.handleMapData().finally(() => this.changeRef.detectChanges());
  }

  private handleMapData(): Promise<Array<any>> {
    if (
      this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline
    ) {
      return Promise.all([]);
    }

    this._isLoading = true;

    const promises: Array<Promise<any>> = [];

    if (!this._hasFetchedData) {
      promises.push(
        this.populateMap()
          .then(() => this.logger.debug('Done populating map.'))
          .catch(() => this.logger.error('Error populating map.'))
          .finally(() => {
            this._hasFetchedData = true;

            if (this._isFetchDataError) {
              this.toastService.presentToast(
                'page-map.fetch-error',
                Duration.short
              );
              this._isFetchDataError = false;
            }
          })
      );
    }

    promises.push(
      this.obsService
        .postStoredObservations()
        .then(() => this.logger.debug('Done posting stored observations.'))
        .catch(() => this.logger.error('Error posting stored observations.'))
    );

    return Promise.all(promises).finally(() => (this._isLoading = false));
  }

  private populateMap(): Promise<Array<void>> {
    const promises: Array<Promise<void>> = [];

    promises.push(
      this.newsService.fetchEvents().catch((err) => {
        this.logger.error('Error fetching the events.', err);
        this._isFetchDataError = true;
      })
    );

    promises.push(
      this.newsService.fetchAlerts().catch((err) => {
        this.logger.error('Error fetching the alerts.', err);
        this._isFetchDataError = true;
      })
    );

    promises.push(
      this.obsService.fetchObservations().catch((err) => {
        this.logger.error('Error fetching the observations.', err);
        this._isFetchDataError = true;
      })
    );

    return Promise.all(promises);
  }

  onLegendIconClick(e: MouseEvent): boolean {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.stopPropagation();

    const event = document.createEvent('MouseEvent');
    const btn = document.querySelector('#btn-legend');

    event.initEvent('click', true, true);
    btn.dispatchEvent(event);

    return false;
  }

  async onLegendClick(e: MouseEvent) {
    const popover = await this.popoverCtr.create({
      component: LegendComponent,
      componentProps: {
        hasUserObsMarkers: this._map.hasLayer(this._userObsMarkers),
        hasObsMarkers: this._map.hasLayer(this._obsMarkers),
        hasEventsMarkers: this._map.hasLayer(this._eventMarkers),
        hasAlertsMarkers: this._map.hasLayer(this._alertMarkers),
      },
      event: e,
      showBackdrop: false,
    });

    await popover.present();
  }

  private onPopoverChange(marker: Markers, checked: boolean) {
    switch (marker) {
      case Markers.USER_OBSERVATIONS:
        this.toggleMarkerCluster(this._userObsMarkers, checked);
        break;

      case Markers.OTHER_OBSERVATIONS:
        this.toggleMarkerCluster(this._obsMarkers, checked);
        break;

      case Markers.EVENTS:
        this.toggleMarkerCluster(this._eventMarkers, checked);
        break;

      case Markers.ALERTS:
        this.toggleMarkerCluster(this._alertMarkers, checked);
        break;
    }
  }

  private toggleMarkerCluster(cluster: MarkerClusterGroup, toShow: boolean) {
    const hasCluster = this._map.hasLayer(cluster);

    if (toShow && !hasCluster) {
      this._map.addLayer(cluster);
      return;
    }

    if (!toShow && hasCluster) {
      this._map.removeLayer(cluster);
      return;
    }
  }

  async onAddClick() {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      const networkAlertChoice = await this.presentInsertionAlert(
        'page-map.msg-insert-offline'
      );

      if (networkAlertChoice === 'cancel') {
        return;
      }
    }

    let pos, accuracy;

    if (this._customMarker) {
      pos = this._customMarker.getLatLng();
      accuracy = 0;
    } else if (this._userMarker) {
      this._map.panTo(this._coords);
      this._isMapFollowing = true;
      pos = this._coords;
      accuracy = this._accuracy;
    } else {
      await this.toastService.presentToast(
        'page-map.msg-wait-position',
        Duration.short
      );
      return;
    }

    this.obsService.newObservation = new Observation(pos, accuracy);

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      await this.presentLoading();

      const [roi, roiErr] = await this.mapService
        .pointInRoi(pos)
        .then((v) => [v, undefined])
        .catch((e) => [undefined, e]);

      await this.dismissLoading();

      if (!roi) {
        const roiAlertMsg = `page-map.alert-msg-roi-${
          !!roiErr ? 'error' : 'undefined'
        }`;
        const roiAlertChoice = await this.presentInsertionAlert(roiAlertMsg);

        if (roiAlertChoice === 'cancel') {
          this.obsService.resetNewObservation();
          return;
        }
      }

      this.obsService.newObservation.position.roi = roi;
    }

    const pic = await this.cameraService.takePicture();

    if (pic === PicResult.NO_IMAGE) {
      this.obsService.resetNewObservation();
      return;
    } else if (pic === PicResult.ERROR) {
      await this.toastService.presentToast(
        'common.errors.photo',
        Duration.short
      );
    } else {
      this.obsService.newObservation.photos[0] = pic;
    }

    await this.router.navigate(['/observations/new']);
  }

  private async presentInsertionAlert(msg: string): Promise<string> {
    const alert = await this.alertCtr.create({
      header: this.i18n.instant('common.alerts.header-warning'),
      message: this.i18n.instant(msg),
      buttons: [
        {text: this.i18n.instant('common.alerts.btn-cancel'), role: 'cancel'},
        {
          text: this.i18n.instant('common.alerts.btn-continue'),
          role: 'continue',
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();

    return (await alert.onDidDismiss()).role;
  }

  private async presentLoading() {
    this.loading = await this.loadingCtr.create({
      message: this.i18n.instant('common.wait'),
      showBackdrop: false,
    });

    await this.loading.present();
  }

  private async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }

    this.loading = null;
  }

  private async cachePosition() {
    if (this._coords) {
      await this.storage.set(this._storageKeyPosition, [
        this._coords.lat,
        this._coords.lng,
      ]);
    }
  }

  ionViewWillLeave() {
    this._savedMapCenter = this._map.getCenter();
    this._savedZoomLevel = this._map.getZoom();

    this._map.remove();
    this._map = null;
  }
}
