import {Injectable} from '@angular/core';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {NGXLogger} from 'ngx-logger';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

export enum PicResult {
  NO_IMAGE,
  ERROR,
}

@Injectable({providedIn: 'root'})
export class CameraService {
  private _win: any = window;

  private _baseOpts: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    cameraDirection: this.camera.Direction.BACK,
    allowEdit: false,
    correctOrientation: true,
  };

  constructor(
    private camera: Camera,
    private logger: NGXLogger,
    private domSanitizer: DomSanitizer,
  ) { }

  async takePicture(fromGallery: boolean = false): Promise<string | PicResult> {
    const opts = {
      ...this._baseOpts,
      sourceType: fromGallery
        ? this.camera.PictureSourceType.PHOTOLIBRARY
        : this.camera.PictureSourceType.CAMERA,
    };

    const [pic, err] = await this.camera
      .getPicture(opts)
      .then((v) => [v, undefined])
      .catch((e) => [undefined, e]);

    if (err !== undefined) {
      this.logger.error('Error taking picture', err)
      return err === 'No Image Selected' ? PicResult.NO_IMAGE : PicResult.ERROR;
    }

    return pic;
  }

  getImgSrc(url: string): SafeUrl {
    if (!url) { return }

    return this.domSanitizer.bypassSecurityTrustUrl(this._win.Ionic.WebView.convertFileSrc(url));
  }
}
