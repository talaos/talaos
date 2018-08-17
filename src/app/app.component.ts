import { Events, Nav, Platform } from "ionic-angular";

import { Component, ViewChild } from "@angular/core";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { TranslateService } from "@ngx-translate/core";

import { BackendGlpiService } from "../backends/backend.glpi.service";

import { GlobalVars } from "./globalvars";

import { TicketPage } from "../pages/glpi/ticket/ticket";
import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";

@Component({
  providers: [ BackendGlpiService ],
  templateUrl: "app.html",
})
export class MyApp {
  @ViewChild(Nav) public nav: Nav;
  public rootPage: any = HomePage;
  public pages: Array<{title: string, component: any}>;
  public successConnection = 0;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              public events: Events, translate: TranslateService, private httpService: BackendGlpiService,
              private globalVars: GlobalVars) {

    this.initializeApp();
    const valueFieldName = "value";

    // used for an example of ngFor and navigation
    this.pages = [
      {title: translate.get("Home")[valueFieldName], component: HomePage},
      {title: translate.get("Ticket")[valueFieldName], component: TicketPage},
    ];

    events.subscribe("login:successful", () => {
      this.successConnection++;
      if (this.successConnection === this.globalVars.numberConnections) {
        this.openPage({title: translate.get("Home")[valueFieldName], component: HomePage});
      }
    });

    events.subscribe("login:new", () => {
      this.openPage({title: translate.get("Login")[valueFieldName], component: LoginPage});
    });

    translate.setDefaultLang("en");
    translate.use("en");

    // Use language from GLPI session
    this.httpService.loadConnections();
    if (this.httpService.connections.length > 0) {
      this.httpService.getFullSession()
        .subscribe((data) => {
            if (data.session.glpilanguage === "fr_FR") {
              translate.use("fr_FR");
            }
            globalVars.session = data.session;
            globalVars.setUsername(data.session.glpifirstname + " " + data.session.glpirealname);
            globalVars.setInterfacetype(data.session.glpiactiveprofile.interface);
          },
          function(error) {
            return this.httpService.manageError(error);
          }.bind(this),
        );
    }
  }

  public openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  private initializeApp() {
    this.rootPage = LoginPage;
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.successConnection = 0;
  }
}
