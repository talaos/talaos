import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlpiService } from './services/glpi.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private auth: AuthenticationService,
    private glpi: GlpiService,
    private router: Router,
    private location: Location,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      let params = {};
      if (this.location.path().match(/^(\/[a-z0-9]+\/[a-z0-9]+)$/)) {
        params = {redirect: this.location.path()};
      }
      this.router.navigate(['login'], {queryParams: params});
    });
  }
}
