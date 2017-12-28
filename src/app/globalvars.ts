import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from "rxjs/Subject";

@Injectable()
export class GlobalVars {
  public username = new Subject<any>();
  public session = {};

  public setUsername(username: string) {
    this.username.next(username);
  }

  public getUsername(): Observable<any> {
    return this.username.asObservable();
  }

}
