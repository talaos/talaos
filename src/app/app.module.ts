import { HttpClient, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from "@angular/core";
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
import { SearchPage } from "../pages/glpi/generic/searchlist";
import { Searchmodal } from "../pages/glpi/generic/searchmodal";
import { TicketPage } from "../pages/glpi/ticket/ticket";
import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { GeneralMenu } from "../pages/menu/menu";
import { MyApp } from "./app.component";

import { TicketForm } from "../pages/glpi/ticket/ticket_form";

import { GlpiHomeAdminPage } from "../pages/glpi/home/admin";
import { GlpiHomeEnduserPage } from "../pages/glpi/home/end-user";
import { GlpiHomePage } from "../pages/glpi/home/home";
import { GlpiMenu } from "../pages/glpi/menu/menu";

import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { GlpiHttpInterceptor } from "../backends/backend.glpi.interceptor";

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
    GeneralMenu,
    GlpiHomePage,
    GlpiMenu,
    TicketPage,
    TicketForm,
    SearchPage,
    Searchmodal,
    DropdownSelect,
    GlpiHomeEnduserPage,
    GlpiHomeAdminPage,
  ],
  entryComponents: [
    MyApp,
    LoginPage,
    GlpiHomePage,
    HomePage,
    GeneralMenu,
    GlpiMenu,
    TicketPage,
    TicketForm,
    SearchPage,
    Searchmodal,
    DropdownSelect,
    GlpiHomeEnduserPage,
    GlpiHomeAdminPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    NgxDatatableModule,
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
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: GlpiHttpInterceptor,
    },
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AppModule {}
