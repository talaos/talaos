import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class GlpiHttpInterceptor implements HttpInterceptor {

  private cache;

  constructor() {
    this.cache = new Map<string, [Date, HttpResponse<any>]>();
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.indexOf("listSearchOptions") === -1) {
      return this.sendRequest(req, next);
    }
    const cachedResponse = this.cache.get(req.url);
    return cachedResponse
      ? Observable.of(cachedResponse)
      : this.sendRequest(req, next);
  }

  private sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).do(event => {
      if (event instanceof HttpResponse) {
        this.cache.set(req.url, event);
      }
    });
  }
}
