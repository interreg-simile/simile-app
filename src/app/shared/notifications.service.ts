import {Injectable} from '@angular/core';
import {OneSignal} from '@ionic-native/onesignal/ngx';

const oneSignalAppId = '9d182bac-d900-462b-afe1-62523e5aa86e';
const firebaseSenderId = '52742133080';

@Injectable({providedIn: 'root'})
export class NotificationsService {
  private iosSettings = {
    kOSSettingsKeyAutoPrompt: true,
    kOSSettingsKeyInAppLaunchURL: false,
  }

  constructor(private oneSignal: OneSignal) {}

  initOneSignal() {
    this.oneSignal.startInit(oneSignalAppId, firebaseSenderId)

    this.oneSignal.setLogLevel({logLevel: 6, visualLevel: 0})

    this.oneSignal.iOSSettings(this.iosSettings)
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.endInit();
  }
}
