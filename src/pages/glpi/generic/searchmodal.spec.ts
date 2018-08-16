import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IonicModule, NavController, Platform } from "ionic-angular/index";
import { NavParamsMock, PlatformMock } from "../../../../test-config/mocks-ionic";
import { Searchmodal } from "./searchmodal";

import { HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {NavParams, ViewController} from "ionic-angular";
import { mockView } from "ionic-angular/util/mock-providers";
import {} from "jasmine";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { GlobalVars } from "../../../app/globalvars";

describe("Searchmodal", () => {
  let de: DebugElement;
  let comp: Searchmodal;
  let fixture: ComponentFixture<Searchmodal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Searchmodal ],
      imports: [
        IonicModule.forRoot(Searchmodal),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        NavController,
        { provide: NavParams, useClass: NavParamsMock },
        { provide: Platform, useClass: PlatformMock},
        BackendGlpiService,
        GlobalVars,
        { provide: ViewController, useValue: mockView() },
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Searchmodal);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css("h3"));
  });

  it("Test fonction convert the search engine into GLPI search compatible", () => {
    const result = comp.convertToGLPIType();
    const expected = {
      criteria: [{
        field: 1,
        searchtype: "contains",
        value: "",
      }],
      forcedisplay: [1],
    };
    expect(result).toEqual(expected);
  });
});
