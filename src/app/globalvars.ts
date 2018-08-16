import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from "rxjs/Subject";

@Injectable()
export class GlobalVars {
  public username = new Subject<any>();
  public interfacetype = new Subject<any>();
  public session = {};
  public searchOptions = {};
  public numberConnections = 0;

  public setUsername(username: string) {
    this.username.next(username);
  }

  public getUsername(): Observable<any> {
    return this.username.asObservable();
  }

  public setInterfacetype(interfacetype: string) {
    this.interfacetype.next(interfacetype);
  }

  public getInterfacetype(): Observable<any> {
    return this.interfacetype.asObservable();
  }

  public setSearchoptions(itemtype, idkey, interfacetype: object) {
    if (this.searchOptions[itemtype] === undefined) {
      this.searchOptions[itemtype] = {};
    }
//    if (this.searchOptions[itemtype][idkey] === undefined) {
//      this.searchOptions[itemtype][idkey] = ;
//    }
    this.searchOptions[itemtype][idkey] = interfacetype;
  }

  public getSearchoptions(itemtype, idkey) {
    return this.searchOptions[itemtype][idkey];
  }

  public getSearchoptionsItemtype(itemtype) {
    if (this.searchOptions[itemtype] === undefined) {
      return {};
    }
    return this.searchOptions[itemtype];
  }

}
