import { BackendGlpiService } from "./backend.glpi.service";
import {async, inject} from "@angular/core/testing";
import {} from "jasmine";
import {Events, NavParams, ToastController} from "ionic-angular";
import {Searchmodal} from "../pages/glpi/generic/searchmodal";
import {HttpClient} from "@angular/common/http";
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {ToastControllerMock} from "ionic-mocks";
import {NavParamsMock} from "../../test-config/mocks-ionic";

describe("BackendGlpiService", () => {
  let injector: TestBed;
  let service: BackendGlpiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BackendGlpiService, Events, { provide: ToastController, useClass: ToastControllerMock }],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    });
    injector = getTestBed();
    service = injector.get(BackendGlpiService);
    httpMock = injector.get(HttpTestingController);
  });

/*
  afterEach(() => {
    httpMock.verify();
  });
*/

  it("Test fonction convert the search engine into GLPI search compatible", () => {
    service.doLogin("glpi", "glpi", 0);
    expect(service.connections).toEqual([]);

    service.connections.push({
      app_token: "tokendata",
      name: "glpidata",
      session_token: "sessiontoken",
      url: "http://127.0.0.1/glpi090/apirest.php",
    });
    service.doLogin("glpi", "glpi", 0);
    expect(service.connections).toEqual([
      {
        app_token: "tokendata",
        name: "glpidata",
        session_token: "sessiontoken",
        url: "http://127.0.0.1/glpi090/apirest.php",
      },
    ]);
  });
/*
  service.getFullSession().subscribe((data) => {
    expect(data.length).toBe(2);
  });
*/
});
