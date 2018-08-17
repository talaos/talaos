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
*/
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
