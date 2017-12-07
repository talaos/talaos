/**
 * Created by ddurieux on 2/4/17.
 */
import { Injectable } from "@angular/core";
import { Headers, Http, URLSearchParams } from "@angular/http";
import { Events } from "ionic-angular";
import { ToastController } from "ionic-angular";
import "rxjs/add/operator/map";

@Injectable()
export class BackendService {
    public token = "";
    public glpiurl = "";
    public apptoken = "";

    constructor(private http: Http, public events: Events, public toastCtrl: ToastController) {
        const value: string = localStorage.getItem("session-token");
        if (value && value !== "undefined" && value !== "null") {
            this.token = value;
        }
        this.loadStorage();
    }

    public doLogin(login, password) {
        this.loadStorage();
        const headers = new Headers();
        headers.append("Authorization", "Basic " + btoa(login + ":" + password));
        headers.append("App-Token", this.apptoken);
        this.http.get(this.glpiurl + "/initSession", {headers})
            .map(function convert(res) {
              return res.json();
            })
            .subscribe(function(token) {
                localStorage.setItem("session-token", token.session_token);
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

    public getItem(itemtype, itemId, expand: boolean = true) {
        const headers = new Headers();
        headers.append("App-Token", this.apptoken);
        headers.append("Session-Token", this.token);

        const params: URLSearchParams = new URLSearchParams();
        if (expand) {
          params.set("expand_dropdowns", "1");
        }

        return this.http.get(this.glpiurl + "/" + itemtype + "/" + itemId, {headers, search: params})
            .map(function convert(res) {
              return res.json();
            });
    }

    public getAll(endpoint) {
        const headers = new Headers();
        headers.append("App-Token", this.apptoken);
        headers.append("Session-Token", this.token);

        // headers.append("Cache-control", "no-cache");
        // headers.append("Cache-control", "no-store");
        headers.append("Cache-Control", "max-age=20");
        // headers.append("Expires", "0");
        // headers.append("Pragma", "no-cache");
        return this.http.get(this.glpiurl + "/" + endpoint, {headers})
            .map(function convert(res) {
              return res.json();
            });
    }

    /** Get only a page with all parameters possible */
    public getPage(endpoint, where = null, expandDropdowns = false, getHateoas = true, onlyId = false,
                   range = "0-10", sort = 1, order = "ASC", isDeleted = false) {

        const headers = new Headers();
        headers.append("App-Token", this.apptoken);
        headers.append("Session-Token", this.token);
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
        return this.http.get(this.glpiurl + "/" + endpoint, {headers, search: params})
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

      const headers = new Headers();
      headers.append("App-Token", this.apptoken);
      headers.append("Session-Token", this.token);

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

      return this.http.get(this.glpiurl + "/search/" + endpoint, {headers, search: params})
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
      const headers = new Headers();
      headers.append("App-Token", this.apptoken);
      headers.append("Session-Token", this.token);

      return this.http.get(this.glpiurl + "/listSearchOptions/" + itemtype, {headers})
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
        const headers = new Headers();
        headers.append("App-Token", this.apptoken);
        headers.append("Session-Token", this.token);

        if (itemId === 0) {
          return this.http.post(this.glpiurl + "/" + itemtype, {input}, {headers})
            .map(function convert(res) {
              return res.json();
            });
        } else {
          return this.http.put(this.glpiurl + "/" + itemtype + "/" + itemId, {input}, {headers})
            .map(function convert(res) {
              return res.json();
            });
        }
    }

    public manageError(error) {
      if (error._body.indexOf("ERROR_SESSION_TOKEN_INVALID") > -1) {
        this.token = "";
        localStorage.removeItem("session-token");
        this.events.publish("login:new", "");
      }
    }

  private loadStorage() {
    let value = localStorage.getItem("glpiurl");
    if (value && value !== "undefined" && value !== "null") {
      this.glpiurl = value;
    }

    value = localStorage.getItem("apptoken");
    if (value && value !== "undefined" && value !== "null") {
      this.apptoken = value;
    }
  }

}

/*
@Injectable()
export class MessageService {
    message: string = "";
}
*/
