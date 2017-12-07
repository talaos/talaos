import { ErrorHandler, NgModule } from "@angular/core";
import { Http, HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";

// Multilanguage
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import "rxjs/add/operator/map";

import { BackendComponent } from "../backend/backend.component";
import { BackendService } from "../backend/backend.service";

import { DropdownSelect } from "../dropdownselect/dropdownselect";
import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { TicketPage } from "../pages/ticket/ticket";
import { Search } from "../search/search";
import { MyApp } from "./app.component";

import { TicketForm } from "../pages/ticket/ticket_form";

import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  bootstrap: [IonicApp],
  declarations: [
    MyApp,
    BackendComponent,
    LoginPage,
    HomePage,
    TicketPage,
    TicketForm,
    Search,
    DropdownSelect,
  ],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    TicketPage,
    TicketForm,
    Search,
    DropdownSelect,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        deps: [Http],
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
      },
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BackendService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ],
})
export class AppModule {}
