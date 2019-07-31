import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalvarsService {

  public searchOptions = {};

  constructor() { }

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
