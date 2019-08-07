import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationService } from './services/authentication.service';
import { GlpiService } from './services/glpi.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GlpiHttpInterceptor } from './inteceptors/glpi.interceptor';
import { GlobalvarsService } from './services/globalvars.service';
import { CookieService } from 'ngx-cookie-service';

import { IonicStorageModule } from '@ionic/storage';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, far, fab);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthenticationService,
    GlpiService,
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: GlpiHttpInterceptor,
    },
    GlobalvarsService,
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
