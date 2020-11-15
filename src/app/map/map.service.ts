import {Injectable} from '@angular/core';
import {Geolocation, Geoposition, PositionError} from '@ionic-native/geolocation/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {AlertController} from '@ionic/angular';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {LatLng, Marker, MarkerOptions} from 'leaflet';
import {Router} from '@angular/router';

import {LocationErrors} from '../shared/common.enum';
import {environment} from '../../environments/environment';
import {GenericApiResponse} from '../shared/utils.interface';
import {MinimalObservation} from '../observations/observations.service';
import {eventMarkerIcon, observationMarkerIcon, userObservationMarkerIcon} from '../shared/markers';
import {NetworkService} from '../shared/network.service';
import {Event} from '../news/events/event.model';
import {AuthService} from '../shared/auth.service';

@Injectable({providedIn: 'root'})
export class MapService {
  private readonly _positionWatcherOpts = {
    timeout: 3000,
    enableHighAccuracy: true,
    maximumAge: 0,
  };

  constructor(
    private http: HttpClient,
    private i18n: TranslateService,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private alertCtr: AlertController,
    private networkService: NetworkService,
    private router: Router,
    private authService: AuthService
  ) { }

  watchLocation(): Observable<Geoposition | PositionError> {
    return this.geolocation.watchPosition(this._positionWatcherOpts);
  }

  async checkPositionAvailability(fromClick = false): Promise<LocationErrors> {
    const authStatus = await this.diagnostic.getLocationAuthorizationStatus();

    // If the permission is denied and cannot be asked
    if (
      fromClick &&
      authStatus === this.diagnostic.permissionStatus.DENIED_ALWAYS
    ) {
      await this.presetErrAlert(LocationErrors.AUTH_ERROR);
      return LocationErrors.AUTH_ERROR;
    }

    // If the permission is denied, but can be asked
    if (
      authStatus !== this.diagnostic.permissionStatus.GRANTED ||
      authStatus !== this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE
    ) {
      const req = await this.diagnostic.requestLocationAuthorization();

      if (
        req === this.diagnostic.permissionStatus.DENIED_ALWAYS ||
        req === this.diagnostic.permissionStatus.DENIED_ONCE
      ) {
        return LocationErrors.AUTH_ERROR;
      }
    }

    const gps = await this.diagnostic.isLocationEnabled();

    if (!gps) {
      if (fromClick) {
        await this.presetErrAlert(LocationErrors.GPS_ERROR);
      }
      return LocationErrors.GPS_ERROR;
    }

    return LocationErrors.NO_ERROR;
  }

  async presetErrAlert(errType: LocationErrors): Promise<void> {
    const mKey =
      errType === LocationErrors.AUTH_ERROR
        ? 'page-map.alert-msg-auth'
        : 'page-map.alert-msg-gps';

    const alert = await this.alertCtr.create({
      subHeader: this.i18n.instant(mKey),
      buttons: [this.i18n.instant('common.alerts.btn-ok')],
    });

    await alert.present();
  }

  async pointInRoi(coords: LatLng): Promise<number> {
    const url = `${environment.apiBaseUrl}/${environment.apiVersion}/rois/`;

    const qParams = new HttpParams()
      .set('lat', coords.lat.toString())
      .set('lon', coords.lng.toString());

    const res = await this.http
      .get<GenericApiResponse>(url, {params: qParams})
      .toPromise();

    if (res.data.length) {
      return res.data[0]._id;
    }

    return;
  }

  createObservationMarker(obs: MinimalObservation): Marker {
    const markerOptions: MarkerOptions = {};

    if (obs.uid && obs.uid === this.authService.userId) {
      markerOptions.icon = userObservationMarkerIcon();
      markerOptions.zIndexOffset = 3;
      markerOptions['isPersonal'] = true;
    } else {
      markerOptions.icon = observationMarkerIcon();
      markerOptions.zIndexOffset = 2;
      markerOptions['isPersonal'] = false;
    }

    const marker = new Marker(
      new LatLng(obs.position.coordinates[1], obs.position.coordinates[0]),
      markerOptions
    );

    marker.on('click', () => this.onMarkerClick(['/observations', obs._id]));

    return marker;
  }

  createEventMarker(event: Event): Marker {
    const marker = new Marker(event.coordinates, {
      icon: eventMarkerIcon(),
      zIndexOffset: 1,
    });

    marker.on('click', () => this.onMarkerClick(['news/events/', event.id]));

    return marker;
  }

  private onMarkerClick(url: Array<string>): void {
    if (this.networkService.checkOnlineContentAvailability()) {
      this.router.navigate(url);
    }
  }
}
