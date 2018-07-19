/**
 * Created by ddurieux on 2/4/17.
 */
import { Injectable } from "@angular/core";
import { Headers, Http, URLSearchParams } from "@angular/http";
import { Events } from "ionic-angular";
import { ToastController } from "ionic-angular";
import "rxjs/add/operator/map";

@Injectable()
export class BackendGlpiService {
  public connections = [];

  constructor(private http: Http, public events: Events, public toastCtrl: ToastController) {
      this.loadConnections();
  }

  public doLogin(login, password, connectionNumber) {
    this.loadConnections();
    if (this.connections.length === 0) {
      return;
    }
    const headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(login + ":" + password));
    headers.append("App-Token", this.connections[connectionNumber].app_token);
    this.http.get(this.connections[connectionNumber].url + "/initSession", {headers})
        .map(function convert(res) {
          return res.json();
        })
        .subscribe(function(token) {
            localStorage.setItem("connection_" + connectionNumber + "_session_token", token.session_token);

            this.events.publish("login:successful", "");
        }.bind(this),
        function(error) {
          const toast = this.toastCtrl.create({
            duration: 5000,
            message: error,
          });
          toast.present();
        }.bind(this));
  }

  public getFullSession() {
    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    return this.http.get(this.connections[0].url + "/getFullSession", {headers})
      .map(function convert(res) {
        return res.json();
      });
  }

  public getItem(itemtype, itemId, expand: boolean = true) {
    if (this.connections.length === 0) {
      return;
    }

    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    const params: URLSearchParams = new URLSearchParams();
    if (expand) {
      params.set("expand_dropdowns", "1");
    }

    return this.http.get(this.connections[0].url + "/" + itemtype + "/" + itemId, {headers, search: params})
        .map(function convert(res) {
          return res.json();
        });
  }

  public getAll(endpoint) {
    if (this.connections.length === 0) {
      return;
    }

    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    // headers.append("Cache-control", "no-cache");
    // headers.append("Cache-control", "no-store");
    headers.append("Cache-Control", "max-age=20");
    // headers.append("Expires", "0");
    // headers.append("Pragma", "no-cache");
    return this.http.get(this.connections[0].url + "/" + endpoint, {headers})
        .map(function convert(res) {
          return res.json();
        });
  }

  /** Get only a page with all parameters possible */
  public getPage(endpoint, where = null, expandDropdowns = false, getHateoas = true, onlyId = false,
                 range = "0-10", sort = 1, order = "ASC", isDeleted = false) {

    if (this.connections.length === 0) {
      return;
    }
    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);
    // define a cache of 10 seconds
    // headers.append("Cache-Control", "max-age=10");
    // headers.append("Cache-Control", "max-age=0");
    // manage params
    const params: URLSearchParams = new URLSearchParams();

    if (where !== null) {
      for (const i of Object.keys(where)) {
        params.set("searchText[" + i + "]", where[i]);
      }
    }

    if (expandDropdowns === true) {
      params.set("expand_dropdowns", "true");
    }
    if (getHateoas === true) {
      params.set("get_hateoas", "true");
    } else {
      params.set("get_hateoas", "false");
    }
    if (onlyId === true) {
        params.set("only_id", "true");
    }
    params.set("range", range);
/*
      //params.set("sort", sort);
      params.set("order", order);
*/
    if (isDeleted === true) {
      params.set("is_deleted", "true");
    }
    return this.http.get(this.connections[0].url + "/" + endpoint, {headers, search: params})
        .map(function convert(res) {
            const data = res.json();
            if (res.headers.has("Content-Range")) {
              const ranges = res.headers.get("Content-Range").split("/");
              data._total = ranges[1];
              const therange = ranges[0].split("-");
              data._number = therange[0];
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
    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    const params: URLSearchParams = new URLSearchParams();
    let i = 0;
    for (const item of forcedisplay) {
      params.set("forcedisplay[" + i + "]", String(item));
      i = i + 1;
    }

    let j = 0;
    for (const item of criteria) {
      params.set("criteria[" + j + "][field]", String(item.field));
      params.set("criteria[" + j + "][searchtype]", String(item.searchtype));
      params.set("criteria[" + j + "][value]", String(item.value));
      j = j + 1;
    }

    params.set("range", range);
    params.set("sort", String(sort));
    params.set("order", order);

    return this.http.get(this.connections[0].url + "/search/" + endpoint, {headers, search: params})
      .map(function convert(res) {
        const data = res.json();
        if (res.headers.has("Content-Range")) {
          const ranges = res.headers.get("Content-Range").split("/"); // Content-range give for example 0-20/370328
          data._total = ranges[1];
          const therange = ranges[0].split("-");
          data._number = therange[0];
        } else {
          data._total = 0;
          data._number = 0;
        }
        return data;
      });
  }

  public getListSearchOptions(itemtype) {
    if (this.connections.length === 0) {
      return;
    }
    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    return this.http.get(this.connections[0].url + "/listSearchOptions/" + itemtype, {headers})
      .map(function convert(res) {
        const regex = /"((?!name|table|field|datatype|nosearch|nodisplay|available_searchtypes|uid)[\d|\w]+)"[:]/g;
        const mySelectFields = [];
        mySelectFields.push({
          group: "Default",
          label: "------",
          number: "0",
        });
        const groupname = "";
        const parsed = res.json();
        for (let m = regex.exec(res.text()); m !== null; m = regex.exec(res.text())) {
        // while ((m = regex.exec(res.text())) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          if (typeof parsed[m[1]] === "string") {
            // it's the group name (compat 9.1 only)
            mySelectFields.push(parsed[m[1]]);
          } else {
            if (!("table" in parsed[m[1]])) {
              // it's the group name (compat 9.2)
              mySelectFields.push(parsed[m[1]]);
            } else {
              parsed[m[1]].id = m[1];
              mySelectFields.push(parsed[m[1]]);
            }
          }
        }
        return mySelectFields;
      });
  }

  public saveItem(itemtype, itemId, input) {
    if (this.connections.length === 0) {
      return;
    }
    const headers = new Headers();
    headers.append("App-Token", this.connections[0].app_token);
    headers.append("Session-Token", this.connections[0].session_token);

    if (itemId === 0) {
      return this.http.post(this.connections[0].url + "/" + itemtype, {input}, {headers})
        .map(function convert(res) {
          return res.json();
        });
    } else {
      return this.http.put(this.connections[0].url + "/" + itemtype + "/" + itemId, {input}, {headers})
        .map(function convert(res) {
          return res.json();
        });
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

/*
@Injectable()
export class MessageService {
    message: string = "";
}
*/
