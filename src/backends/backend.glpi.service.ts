/**
 * Created by ddurieux on 2/4/17.
 */
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import { ToastController } from "ionic-angular";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { GlobalVars } from "../app/globalvars";

@Injectable()
export class BackendGlpiService {
  public connections = [];
  private cache;

  constructor(private http: HttpClient, public events: Events, public toastCtrl: ToastController,
              private globalVars: GlobalVars) {
      this.loadConnections();
  }

  public doLogin(login, password, connectionNumber) {
    this.loadConnections();
    if (this.connections.length === 0) {
      return Observable.of({});
    }
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[connectionNumber].app_token,
        "Authorization": "Basic " + btoa(login + ":" + password),
      }),
    };
    return this.http.get(this.connections[connectionNumber].url + "/initSession", httpOptions)
        .map(function(token) {
            localStorage.setItem("connection_" + connectionNumber + "_session_token", token.session_token);
            this.connections[connectionNumber].session_token = token.session_token;

            this.events.publish("login:successful", "");
            return token;
        }.bind(this),
        (error) => {
          console.log(error);
          // const toast = this.toastCtrl.create({
          //   duration: 5000,
          //   message: error,
          // });
          // toast.present();
        });
  }

  public getFullSession() {
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
    };

    // noinspection TsLint
    interface IUserSession {
      session: {
        glpilanguage: string;
        glpifirstname: string;
        glpirealname: string;
        glpiactiveprofile: {
          interface: string;
        }
      };
    }

    return this.http.get<IUserSession>(this.connections[0].url + "/getFullSession", httpOptions);
  }

  public getItem(itemtype, itemId, expand: boolean = true) {
    if (this.connections.length === 0) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
      params: new HttpParams(),
    };

    let params = new HttpParams();

    if (expand) {
      params = params.set("expand_dropdowns", "1");
    }
    httpOptions.params = params;
    return this.http.get(this.connections[0].url + "/" + itemtype + "/" + itemId, httpOptions);
  }

  public getAll(endpoint) {
    if (this.connections.length === 0) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Cache-Control": "max-age=20",
        "Session-Token": this.connections[0].session_token,
      }),
      params: new HttpParams(),
    };

    // headers.append("Cache-control", "no-cache");
    // headers.append("Cache-control", "no-store");
    // headers.append("Expires", "0");
    // headers.append("Pragma", "no-cache");
    return this.http.get(this.connections[0].url + "/" + endpoint, httpOptions);
  }

  /** Get only a page with all parameters possible */
  public getPage(endpoint, where = null, expandDropdowns = false, getHateoas = true, onlyId = false,
                 range = "0-10", sort = 1, order = "ASC", isDeleted = false) {

    if (this.connections.length === 0) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
      observe: "response" as "response",
      params: new HttpParams(),
    };
    let params = new HttpParams();

    // define a cache of 10 seconds
    // headers.append("Cache-Control", "max-age=10");
    // headers.append("Cache-Control", "max-age=0");
    // manage params

    if (where !== null) {
      for (const i of Object.keys(where)) {
        params = params.set("searchText[" + i + "]", where[i]);
      }
    }

    if (expandDropdowns === true) {
      params = params.set("expand_dropdowns", "true");
    }
    if (getHateoas === true) {
      params = params.set("get_hateoas", "true");
    } else {
      params = params.set("get_hateoas", "false");
    }
    if (onlyId === true) {
      params = params.set("only_id", "true");
    }
    params = params.set("range", range);
/*
      //params.set("sort", sort);
      params.set("order", order);
*/
    if (isDeleted === true) {
      params = params.set("is_deleted", "true");
    }
    httpOptions.params = params;

    // noinspection TsLint
    interface IPage {
      count: number;
      data: any;
      order: string;
      sort: number;
      totalcount: number;
      _total: number;
      _number: number;
    }

    return this.http.get<IPage>(this.connections[0].url + "/" + endpoint, httpOptions)
        .map(function convert(res) {
            const data = res.body;
            if (res.headers.has("Content-Range")) {
              const ranges = res.headers.get("Content-Range").split("/");
              data._total = +ranges[1];
              const therange = ranges[0].split("-");
              data._number = +therange[0];
            } else {
              data._total = 0;
              data._number = 0;
            }
            return data;
        });
  }

  public search(endpoint, forcedisplay = [1, 2, 80], criteria = [], range = "0-10", sort = 1, order = "ASC") {

    if (this.connections.length === 0) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
      observe: "response" as "response",
      params: new HttpParams(),
    };
    let params = new HttpParams();

    let i = 0;
    for (const item of forcedisplay) {
      params = params.set("forcedisplay[" + i + "]", String(item));
      i = i + 1;
    }

    let j = 0;
    for (const item of criteria) {
      params = params.set("criteria[" + j + "][field]", String(item.field));
      params = params.set("criteria[" + j + "][searchtype]", String(item.searchtype));
      params = params.set("criteria[" + j + "][value]", String(item.value));
      j = j + 1;
    }

    params = params.set("range", range);
    params = params.set("sort", String(sort));
    params = params.set("order", order);

    httpOptions.params = params;

    // noinspection TsLint
    interface ISearch {
      data: any;
      count: number;
      order: string;
      sort: string;
      totalcount: number;
    }

    return Observable.forkJoin(
      this.getListSearchOptions(endpoint),
      this.http.get<ISearch>(this.connections[0].url + "/search/" + endpoint, httpOptions),
    ).map(([listOptions, searchList]) => {
      const searchOptions = this.globalVars.getSearchoptionsItemtype(endpoint);
      const data = {
        data: [],
        meta: {
          count: searchList.body.count,
          order: searchList.body.order,
          sort: searchOptions[searchList.body.sort].uid,
          totalcount: searchList.body.totalcount,
        },
      };
      if (searchList.body.data !== undefined) {
        for (const item of searchList.body.data) {
          const newItem = {};
          for (const field of Object.keys(item)) {
            newItem[searchOptions[field].uid] = {
              datatype: searchOptions[field].datatype,
              name: searchOptions[field].name,
              value: item[field],
            };
          }
          data.data.push(newItem);
        }
      }
      return data;
    });
  }

  /**
   * Get the List of search options of an itemtype.
   * This queries will be cached the first time through an HTTP Interceptor and so return from cache the next times
   *
   * @param itemtype the name of the itemtype (Computer, Ticket...)
   */
  public getListSearchOptions(itemtype) {
    if (this.connections.length === 0) {
      this.connections[0] = {
        app_token: "",
        session_token: "",
        url: "",
      };
    }

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
      params: new HttpParams(),
    };
    return this.http.get(this.connections[0].url + "/listSearchOptions/" + itemtype, httpOptions)
      .map((options) => {
        for (const key in options) {
          if (options[key] && options[key].field !== "undefined") {
            if (options[key].uid !== undefined) {
              options[key].uid = options[key].uid.replace(/\./gi, "__");
            }
            this.globalVars.setSearchoptions(itemtype, key, options[key]);
          }
        }
        return options;
      });
  }

  public saveItem(itemtype, itemId, input) {
    if (this.connections.length === 0) {
      return;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.connections[0].app_token,
        "Session-Token": this.connections[0].session_token,
      }),
      params: new HttpParams(),
    };

    if (itemId === 0) {
      return this.http.post(this.connections[0].url + "/" + itemtype, {input}, httpOptions);
    } else {
      return this.http.put(this.connections[0].url + "/" + itemtype + "/" + itemId, {input}, httpOptions);
    }
  }

  public manageError(error) {
    if (this.connections.length === 0) {
      return;
    }
    if (typeof error._body !== "string") {
      this.connections[0].session_token = "";
      localStorage.removeItem("session_token");
      this.events.publish("login:new", "");
    } else if (error._body.indexOf("ERROR_SESSION_TOKEN_INVALID") > -1) {
      this.connections[0].session_token = "";
      localStorage.removeItem("session_token");
      this.events.publish("login:new", "");
    }
  }

  /**
   * load connections from the storage
   */
  public loadConnections() {
    if (this.connections.length === 0) {
      this.connections = [];
      const numberConnections = Number(localStorage.getItem("number_connections"));
      let i = 0;
      while (i < numberConnections) {
        if (localStorage.getItem("connection_" + i + "_name")
          && localStorage.getItem("connection_" + i + "_type") === "glpi") {
          this.connections.push({
            app_token: localStorage.getItem("connection_" + i + "_app_token"),
            name: localStorage.getItem("connection_" + i + "_name"),
            session_token: localStorage.getItem("connection_" + i + "_session_token"),
            url: localStorage.getItem("connection_" + i + "_url"),
          });
        }
        i++;
      }
    }
  }

}
