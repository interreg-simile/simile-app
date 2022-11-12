<h4 align="center">
<img src="https://raw.githubusercontent.com/interreg-simile/simile-app/main/media/logo.png" width="150" alt="SIMILE">
</h4>

# SIMILE - Monitoraggio Laghi

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Cross-platform mobile application build for
[interreg project SIMILE](https://progetti.interreg-italiasvizzera.eu/it/b/78/sistemainformativoperilmonitoraggiointegratodeilaghiinsubriciedeiloroe)
to collect user generated data about the quality of the insubric lakes.

The project aims to improve the actual insubric lakes monitoring system and to create a shared policy for water management
through an advanced informative system and citizen participation. The project is funded under the Interreg Italy-Switzerland Cooperation
Program in order to develop strategies for the protection of lakes.

[![Get it on App Store](https://raw.githubusercontent.com/interreg-simile/simile-app/bdde33ee8be3df1bd06c44f3d3ff6547aaa5fd7d/media/download_on_the_app_store_badge.svg)](https://apps.apple.com/us/app/simile-monitoraggio-laghi/id1534852535)
[![Get it on Google Play](https://raw.githubusercontent.com/interreg-simile/simile-app/bdde33ee8be3df1bd06c44f3d3ff6547aaa5fd7d/media/download_on_the_play_store_badge.svg)](https://play.google.com/store/apps/details?id=com.polimi.simile&hl=it)


## Development setup

The application is written using:
- [Angular 10](https://v10.angular.io/docs)
- [Ionic 5](https://ionicframework.com/docs)
- [Cordova](https://cordova.apache.org/)

To develop the service locally you need Node.js installed with the Ionic CLI package:
```shell
npm install -g @ionic/cli
```

Once you have all the dependencies in place, you can launch:

```shell
npm i
```

This command will install the dependencies.

Now you can go in `src/environments` folder and add your environment settings.
Create a file called `environment.ts` and a file called `environment.prod.ts` with the structure shown in `environment.example.ts`.

### Develop for Android

Follow this [instructions](https://ionicframework.com/docs/developing/android).

To sign your App for production you will need to follow this
[instructions](https://developer.android.com/studio/publish/app-signing.html) and create a `.keystore` file.
Now create a file called `build.json` with the following content
```json
{
  "android": {
    "release": {
      "keystore": "path_to_your_keystore_file",
      "storePassword": "password_to_your_keystore_file",
      "alias": "simile_app",
      "password" : "password_to_your_keystore_file",
      "keystoreType": ""
    }
  }
}
```
Once you have the dependencies in place, run
```shell
npm run sign:android
```
to sign the App.

### Develop for iOS

Follow this [instructions](https://ionicframework.com/docs/developing/ios) for development and the
[instructions](https://ionicframework.com/docs/deployment/app-store) for deployment.

### Generate resources

Resources (icons and splash screens) are generated through 
[capacitor-assets](https://github.com/ionic-team/capacitor-assets).

Sources are located in `assets` folder. To generate resources run:

```shell
npx capacitor-assets generate --ios --android
```

## Contributions

Developed by [Edoardo Pessina](mailto:edoardopessina.priv@gmail.com) - [GitHub](https://github.com/epessina)

A special thanks to the project partners:

- Politecnico di Milano
- Scuola universitaria professionale della Svizzera italiana
- Regione Lombardia
- CNR IRSA
- Fondazione Politecnico di Milano
- Cantone Ticino


## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) © [SIMILE Project](mailto:interreg-simile@polimi.it)

---

