import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Event } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, map, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { GlobalvarsService } from './globalvars.service';

@Injectable({
  providedIn: 'root'
})
export class GlpiService {
  public connections = [];
  private cache;
  private app_token = "....";
  private session_token = "...";
  private glpi_url = "http://127.0.0.1/glpi/apirest.php";

  constructor(private http: HttpClient, private globalVars: GlobalvarsService) {
    // this.doLogin("glpi", "glpi").subscribe();

  }


  public doLogin(login, password) {
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Authorization": "Basic " + btoa(login + ":" + password),
      }),
    };
    return this.http.get(this.glpi_url + "/initSession", httpOptions)
      .pipe(
        map(token => {
          console.log(token);
          if (token === "ERROR_SESSION_TOKEN_INVALID\",\"session_token seems invalid") {
            this.session_token = "";
          } else {
            this.session_token = token["session_token"];
          }
          return token;
        })
      );
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
        glpiID: string,
        glpilanguage: string;
        glpifirstname: string;
        glpirealname: string;
        glpiactiveprofile: {
          interface: string;
        }
      };
    }
    return this.http.get(this.glpi_url + "/getFullSession", httpOptions);
  }

  public getItem(itemtype, itemId, expand: boolean = true) {
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Session-Token": this.session_token,
      }),
      params: new HttpParams(),
    };

    let params = new HttpParams();

    if (expand) {
      params = params.set("expand_dropdowns", "1");
    }
    httpOptions.params = params;
    return this.http.get(this.glpi_url + "/" + itemtype + "/" + itemId, httpOptions);
  }

  /** Get only a page with all parameters possible */
  public getItemsRestrict(endpoint, where = null, expandDropdowns = false, getHateoas = true, onlyId = false,
                          range = "0-50", sort = "", order = "ASC", isDeleted = false) {

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Session-Token": this.session_token,
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

    if (sort !== "") {
      params = params.set("sort", sort);
      params = params.set("order", order);
    }

    if (isDeleted === true) {
      params = params.set("is_deleted", "true");
    }
    httpOptions.params = params;

    return this.http.get(this.glpi_url + "/" + endpoint, httpOptions)
      .pipe(
        map(function convert(res) {
          const data = {
            count: Object.keys(res.body).length,
            data: res.body,
            end: 0,
            start: 0,
            totalcount: 0,
          };
          if (res.headers.has("Content-Range")) {
            const ranges = res.headers.get("Content-Range").split("/");
            data.totalcount = +ranges[1];
            const therange = ranges[0].split("-");
            data.start = +therange[0];
            data.end = +therange[1];
            data.count = Object.keys(res.body).length;
          }
          return data;
        })
      );
  }

  public search(endpoint, forcedisplay = [1, 2, 80], criteria = [], range = "0-10", sort = 1, order = "ASC") {

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Session-Token": this.session_token,
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
      // if ("criteria" in item) {
      //   params = params.set("criteria[" + j + "][link]", String(item.link));
      //   let k = 0;
      //   for (const item2 of item.criteria) {
      //     params = params.set("criteria[" + j + "][criteria][" + k + "][link]", String(item2.link));
      //     params = params.set("criteria[" + j + "][criteria][" + k + "][field]", String(item2.field));
      //     params = params.set("criteria[" + j + "][criteria][" + k + "][searchtype]", String(item2.searchtype));
      //     params = params.set("criteria[" + j + "][criteria][" + k + "][value]", String(item2.value));
      //     k = k + 1;
      //   }
      // } else {
      params = params.set("criteria[" + j + "][link]", String(item.link));
      params = params.set("criteria[" + j + "][field]", String(item.field));
      params = params.set("criteria[" + j + "][searchtype]", String(item.searchtype));
      params = params.set("criteria[" + j + "][value]", String(item.value));
      // }
      j = j + 1;
    }

    params = params.set("range", range);
    params = params.set("sort", String(sort));
    params = params.set("order", order);

    params = params.set("rawdata", "1");

    httpOptions.params = params;

    // noinspection TsLint
    interface ISearch {
      data: any;
      count: number;
      order: string;
      sort: string;
      totalcount: number;
    }

    return forkJoin(
      this.getListSearchOptions(endpoint),
      this.http.get<ISearch>(this.glpi_url + "/search/" + endpoint, httpOptions),
    ).pipe(
      map(([listOptions, searchList]) => {
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
              id: field,
              name: searchOptions[field].name,
              value: item[field],
            };
          }
          data.data.push(newItem);
        }
      }
      return data;
    })
    );
  }

  /**
   * Get the List of search options of an itemtype.
   * This queries will be cached the first time through an HTTP Interceptor and so return from cache the next times
   *
   * @param itemtype the name of the itemtype (Computer, Ticket...)
   */
  public getListSearchOptions(itemtype) {

    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Session-Token": this.session_token,
      }),
      params: new HttpParams(),
      responseType: "text" as "text",
    };
    return this.http.get(this.glpi_url + "/listSearchOptions/" + itemtype, httpOptions)
      .pipe(
        map((res) => {
        // We get only keys of the first level of the json string
        const re = /\"([a-z|\d+]+)\"\:\{\"name\"\:\"[^\"]*\"|(\"(plugins)\":\"[^\"]*\")/g;
        let myArray;
        const orderedKeys = [];
        while ((myArray = re.exec(res)) !== null) {
          orderedKeys.push(myArray[1]);
        }
        // console.log(orderedKeys);
        const options = JSON.parse(res);
        for (const key in orderedKeys) {
          if (options[key] && options[key].field !== "undefined") {
            if (options[key].uid !== undefined) {
              options[key].uid = options[key].uid.replace(/\./gi, "__");
              options[key].id = key;
            }
            this.globalVars.setSearchoptions(itemtype, key, options[key]);
          }
        }
        return options;
      })
      );
  }

  public saveItem(itemtype, itemId, input) {
    const httpOptions = {
      headers: new HttpHeaders({
        "App-Token": this.app_token,
        "Session-Token": this.session_token,
      }),
      params: new HttpParams(),
    };

    if (itemId === 0) {
      return this.http.post(this.glpi_url + "/" + itemtype, {input}, httpOptions);
    } else {
      return this.http.put(this.glpi_url + "/" + itemtype + "/" + itemId, {input}, httpOptions);
    }
  }


}
