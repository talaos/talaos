import { HttpClient, HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";

// Multilanguage
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import "rxjs/add/operator/map";

import { BackendGlpiComponent } from "../backends/backend.glpi.component";
import { BackendGlpiService } from "../backends/backend.glpi.service";
import { GlobalVars } from "./globalvars";

import { DropdownSelect } from "../dropdownselect/dropdownselect";
import { TicketPage } from "../pages/glpi/ticket/ticket";
import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { Search } from "../search/search";
import { MyApp } from "./app.component";

import { TicketForm } from "../pages/glpi/ticket/ticket_form";

import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  bootstrap: [IonicApp],
  declarations: [
    MyApp,
    BackendGlpiComponent,
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
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        deps: [HttpClient],
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
      },
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BackendGlpiService,
    GlobalVars,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ],
})
export class AppModule {}
