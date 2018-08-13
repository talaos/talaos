import { BackendGlpiService } from "./backend.glpi.service";
import {async, inject} from "@angular/core/testing";
import {} from "jasmine";
import {Events, NavParams, ToastController} from "ionic-angular";
import {Searchmodal} from "../pages/glpi/generic/searchmodal";
import {HttpClient} from "@angular/common/http";
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {ToastControllerMock} from "ionic-mocks";
import {NavParamsMock} from "../../test-config/mocks-ionic";

describe("BackendGlpiService", () => {
  let injector: TestBed;
  let service: BackendGlpiService;
  let httpMock: HttpTestingController;
  let http: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BackendGlpiService, Events, {provide: ToastController, useClass: ToastControllerMock}],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    });
    injector = getTestBed();
    service = injector.get(BackendGlpiService);
    httpMock = injector.get(HttpTestingController);
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function _addFirstConnection() {
    service.connections.push({
      app_token: "tokendata",
      name: "glpidata",
      session_token: "sessiontoken",
      url: "http://127.0.0.1/glpi090/apirest.php",
    });
  }

  it("Test fonction convert the search engine into GLPI search compatible", () => {
    const sessionToken = { session_token: "86q9nuqrkil6op6bkubbte8bf7" };

    service.doLogin("glpi", "glpi", 0);
    expect(service.connections).toEqual([]);

    _addFirstConnection();
    service.doLogin("glpi", "glpi", 0);

    http.expectOne("http://127.0.0.1/glpi090/apirest.php/initSession").flush(sessionToken);
    expect(service.connections).toEqual([
      {
        app_token: "tokendata",
        name: "glpidata",
        session_token: "86q9nuqrkil6op6bkubbte8bf7",
        url: "http://127.0.0.1/glpi090/apirest.php",
      },
    ]);
  });

  it("Test getFullSession", () => {
    const sessionData = {session: {
        glpiID: 2,
        glpiname: "glpi",
      },
    };
    let sessionAnswer;

    _addFirstConnection();

    service.getFullSession().subscribe((data) => {
      sessionAnswer = data;
    });

    http.expectOne("http://127.0.0.1/glpi090/apirest.php/getFullSession").flush(sessionData);
    expect(sessionAnswer).toEqual(sessionData);
  });

  it("test get an item - no expand", () => {
    const glpiItem = {
      entities_id: 0,
      id: 10,
      links: [
        {
          href: "http://127.0.0.1/glpi090/apirest.php/Entity/0",
          rel: "Entity",
        },
      ],
      name: "pc-test",
    };
    let getTheItem;

    _addFirstConnection();

    service.getItem("Computer", 10, false).subscribe((data) => {
      getTheItem = data;
    });
    http.expectOne("http://127.0.0.1/glpi090/apirest.php/Computer/10").flush(glpiItem);
    expect(getTheItem).toEqual(glpiItem);
  });

  it("test get an item - expand", () => {
    const glpiItem = {
      entities_id: "Root entity",
      id: 10,
      links: [
        {
          href: "http://127.0.0.1/glpi090/apirest.php/Entity/0",
          rel: "Entity",
        },
      ],
      name: "pc-test",
    };
    let getTheItem;

    _addFirstConnection();

    service.getItem("Computer", 10).subscribe((data) => {
      getTheItem = data;
    });
    http.expectOne("http://127.0.0.1/glpi090/apirest.php/Computer/10?expand_dropdowns=1").flush(glpiItem);
    expect(getTheItem).toEqual(glpiItem);
  });
/*
  it("test get all items [TODO]", () => {

  });
*/

  it("test get page - simple", () => {
    const httpPageComputer = {
      count: 4,
      data: [
        {
          1: "test-PC1",
          2: 1,
          80: "Root entity",
        },
        {
          1: "test-PC2",
          2: 2,
          80: "Root entity",
        },
        {
          1: "test-PC3",
          2: 3,
          80: "Root entity",
        },
        {
          1: "test-PC4",
          2: 4,
          80: "Root entity",
        },
      ],
      order: "ASC",
      sort: 1,
      totalcount: 4,
    };
    httpPageComputer["content-range"] = "0-3/4";
    let gotPage;

    _addFirstConnection();

    service.getPage("Computer").subscribe((data) => {
      gotPage = data;
    });
    http.expectOne("http://127.0.0.1/glpi090/apirest.php/Computer?get_hateoas=true&range=0-10").flush(httpPageComputer);
    expect(gotPage).toEqual(httpPageComputer);
  });


});
