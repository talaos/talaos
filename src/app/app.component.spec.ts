import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { IonicModule, Platform } from "ionic-angular";

import { HttpClientTestingModule} from "@angular/common/http/testing";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { GlobalVars } from "./globalvars";

import { MyApp } from "./app.component";

import { PlatformMock, SplashScreenMock, StatusBarMock } from "../../test-config/mocks-ionic";
import { BackendGlpiService } from "../backends/backend.glpi.service";

describe("MyApp Component", () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp],
      imports: [
        IonicModule.forRoot(MyApp),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        TranslateService,
        BackendGlpiService,
        GlobalVars,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });

  it("should be created", () => {
    expect(component instanceof MyApp).toBe(true);
  });

});
