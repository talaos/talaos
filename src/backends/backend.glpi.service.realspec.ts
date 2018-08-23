import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { getTestBed, TestBed } from "@angular/core/testing";
import { Events, ToastController } from "ionic-angular";
import { ToastControllerMock } from "ionic-mocks";
import {} from "jasmine";
import { GlobalVars } from "../app/globalvars";
import { GlpiHttpInterceptor } from "./backend.glpi.interceptor";
import { BackendGlpiService } from "./backend.glpi.service";

describe("BackendGlpiService", () => {
  let injector: TestBed;
  let service: BackendGlpiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [BackendGlpiService, Events, {provide: ToastController, useClass: ToastControllerMock}, GlobalVars,
        HttpClient,
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
  });

  function _addFirstConnection() {
    service.connections.push({
      app_token: "aRpH7UQAd7z3j7sq0WF1atqRFtDLLfal1c9oyWD8",
      name: "glpidata",
      session_token: "",
      url: "http://127.0.0.1/talaos_backends/glpi9.3/apirest.php",
    });
  }

/*
  it("Test fonction convert the search engine into GLPI search compatible", () => {
    const sessionToken = { session_token: "86q9nuqrkil6op6bkubbte8bf7" };

    service.doLogin("glpi", "glpi", 0);
    expect(service.connections).toEqual([]);

    _addFirstConnection();
    service.doLogin("glpi", "glpi", 0);

    expect(service.connections).toEqual([
      {
        app_token: "aRpH7UQAd7z3j7sq0WF1atqRFtDLLfal1c9oyWD8",
        name: "glpidata",
        session_token: "7EroHzpT8iRW49pSUS5OiJx0PwqQz5pLb0aMoy9U",
        url: "http://127.0.0.1/talaos_backends/glpi9.3/apirest.php",
      },
    ]);
  });
*/
  it("Test getFullSession", (done) => {
    const sessionData = {session: {
        glpiID: 2,
        glpiname: "glpi",
      },
    };
    let sessionAnswer;

    _addFirstConnection();

    service.doLogin("glpi", "glpi", 0)
      .subscribe((token) => {
        service.getFullSession()
          .subscribe((data) => {
              sessionAnswer = data;
            });
      });
    setTimeout(() => {
      expect(sessionAnswer.session.glpiID).toEqual(sessionData.session.glpiID);
      expect(sessionAnswer.session.glpiname).toEqual(sessionData.session.glpiname);
      done();
    }, 2000);
  });
/*
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
*/
  it("test get items restrict - simple", (done) => {
    const httpDatas = {
      count: 6,
      data: [
        {
          id: 29,
          itemtype: "Computer",
          num: 31,
          rank: 1,
          users_id: 0,
        },
        {
          id: 30,
          itemtype: "Computer",
          num: 23,
          rank: 2,
          users_id: 0,
        },
        {
          id: 31,
          itemtype: "Computer",
          num: 5,
          rank: 3,
          users_id: 0,
        },
        {
          id: 32,
          itemtype: "Computer",
          num: 4,
          rank: 4,
          users_id: 0,
        },
        {
          id: 33,
          itemtype: "Computer",
          num: 40,
          rank: 5,
          users_id: 0,
        },
        {
          id: 34,
          itemtype: "Computer",
          num: 45,
          rank: 6,
          users_id: 0,
        },
      ],
      end: 5,
      start: 0,
      totalcount: 229,
    };
    let gotItems;

    _addFirstConnection();

    service.doLogin("glpi", "glpi", 0)
      .subscribe((token) => {
        service.getItemsRestrict("DisplayPreference",  null, false, true, false, "0-5").subscribe((data) => {
          gotItems = data;
        });
      });
    setTimeout(() => {
      expect(gotItems).toEqual(httpDatas);
      done();
    }, 2000);
  });

  it("test search - simple", (done) => {
    const httpListSearchOptions = {
      1: {
        available_searchtypes: [
          "contains",
          "equals",
          "notequals",
        ],
        datatype: "itemlink",
        field: "name",
        name: "Name",
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
        name: "Entity",
        nodisplay: false,
        nosearch: false,
        table: "glpi_entities",
        uid: "Computer.Entity.completename",
      },
    };
    let gotSearch;

    const searchReturnExpected = {
      data: [
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entity",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 1,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Name",
            value: "test-PC1",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entity",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 2,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Name",
            value: "test-PC2",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entity",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 3,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Name",
            value: "test-PC3",
          },
        },
        {
          Computer__Entity__completename: {
            datatype: "dropdown",
            name: "Entity",
            value: "Root entity",
          },
          Computer__id: {
            datatype: "number",
            name: "ID",
            value: 4,
          },
          Computer__name: {
            datatype: "itemlink",
            name: "Name",
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

    _addFirstConnection();

    service.doLogin("glpi", "glpi", 0)
      .subscribe((token) => {
        service.search("Computer").subscribe((data) => {
          gotSearch = data;
        });
      });
    setTimeout(() => {
      expect(gotSearch).toEqual(searchReturnExpected);
      done();
    }, 2000);
  });

  it("test search - simple - no data", (done) => {
    const httpListSearchOptions = {
      1: {
        available_searchtypes: [
          "contains",
          "equals",
          "notequals",
        ],
        datatype: "itemlink",
        field: "name",
        name: "Name",
        nodisplay: false,
        nosearch: false,
        table: "glpi_monitors",
        uid: "Monitor.name",
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
        table: "glpi_monitors",
        uid: "Monitor.id",
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
        name: "Entity",
        nodisplay: false,
        nosearch: false,
        table: "glpi_entities",
        uid: "Monitor.Entity.completename",
      },
    };
    let gotSearch;

    const searchReturnExpected = {
      data: [],
      meta: {
        count: 0,
        order: "ASC",
        sort: "Monitor__name",
        totalcount: 0,
      },
    };

    _addFirstConnection();

    service.doLogin("glpi", "glpi", 0)
      .subscribe((token) => {
        service.search("Monitor").subscribe((data) => {
          gotSearch = data;
        });
      });
    setTimeout(() => {
      expect(gotSearch).toEqual(searchReturnExpected);
      done();
    }, 2000);
  });


});
