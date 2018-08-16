import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { getTestBed, TestBed } from "@angular/core/testing";
import {Events, NavParams, ToastController} from "ionic-angular";
import {ToastControllerMock} from "ionic-mocks";
import {} from "jasmine";
import {GlobalVars} from "../app/globalvars";
import { GlpiHttpInterceptor } from "./backend.glpi.interceptor";
import { BackendGlpiService } from "./backend.glpi.service";

describe("BackendGlpiService", () => {
  let injector: TestBed;
  let service: BackendGlpiService;
  let httpMock: HttpTestingController;
  let http: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BackendGlpiService, Events, {provide: ToastController, useClass: ToastControllerMock}, GlobalVars,
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: GlpiHttpInterceptor,
        }],
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

  it("test search - simple", () => {
    const httpSearchComputer = {
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
    httpSearchComputer["content-range"] = "0-3/4";
    const httpListSearchOptions = {
      1: {
        available_searchtypes: [
          "contains",
          "equals",
          "notequals",
        ],
        datatype: "itemlink",
        field: "name",
        name: "Nom",
        nodisplay: false,
        nosearch: false,
        table: "glpi_computers",
        uid: "Computer.name",
      },
      2: {
        available_searchtypes: [
          "contains",
        ],
        datatype: "number",
        field: "id",
        name: "ID",
        nodisplay: false,
        nosearch: false,
        table: "glpi_computers",
        uid: "Computer.id",
      },
      80: {
        available_searchtypes: [
          "contains",
          "equals",
          "notequals",
          "notunder",
          "under",
        ],
        datatype: "dropdown",
        field: "completename",
        name: "Entité",
        nodisplay: false,
        nosearch: false,
        table: "glpi_entities",
        uid: "Computer.Entity.completename",
      },
    };
    let gotSearch;

    _addFirstConnection();

    service.search("Computer").subscribe((data) => {
      gotSearch = data;
    });

    http.expectOne("http://127.0.0.1/glpi090/apirest.php/search/Computer?forcedisplay%5B0%5D=1" +
      "&forcedisplay%5B1%5D=2&forcedisplay%5B2%5D=80&range=0-10&sort=1&order=ASC").flush(httpSearchComputer);

    http.expectOne("http://127.0.0.1/glpi090/apirest.php/listSearchOptions/Computer").flush(httpListSearchOptions);

    const searchReturnExpected = {
      data: [
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entité",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 1,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Nom",
            value: "test-PC1",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entité",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 2,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Nom",
            value: "test-PC2",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entité",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 3,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Nom",
            value: "test-PC3",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entité",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 4,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Nom",
            value: "test-PC4",
          },
        },
      ],
      meta: {
        count: 4,
        order: "ASC",
        sort: "Computer__name",
        totalcount: 4,
      },
    };
    expect(gotSearch).toEqual(searchReturnExpected);

    // Second time we to same query and it may not call API for listSearchOptions because it must be in cache

    service.search("Computer").subscribe((data) => {
      gotSearch = data;
    });

    http.expectOne("http://127.0.0.1/glpi090/apirest.php/search/Computer?forcedisplay%5B0%5D=1" +
      "&forcedisplay%5B1%5D=2&forcedisplay%5B2%5D=80&range=0-10&sort=1&order=ASC").flush(httpSearchComputer);

    expect(gotSearch).toEqual(searchReturnExpected);
  });

});
