import { Events, Nav, Platform } from "ionic-angular";

import { Component, ViewChild } from "@angular/core";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { TicketPage } from "../pages/ticket/ticket";

@Component({
  templateUrl: "app.html",
})
export class MyApp {
  @ViewChild(Nav) public nav: Nav;
  public rootPage: any = HomePage;
  public pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              public events: Events) {

    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: "Home", component: HomePage },
      { title: "Ticket", component: TicketPage },
    ];

    events.subscribe("login:successful", () => {
      this.openPage({ title: "Home", component: HomePage });
    });

    events.subscribe("login:new", () => {
      this.openPage({ title: "Login", component: LoginPage });
    });

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
  }
}
