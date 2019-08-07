import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Storage } from '@ionic/storage';
import SimpleCrypto from 'simple-crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private simpleCrypto;

  constructor(private cookieService: CookieService, private storage: Storage) {
    this.simpleCrypto = new SimpleCrypto(this.getCookieCryptoKey());
  }

  // cookie used to generate a key
  private checkCookie() {
    return this.cookieService.check('cryptokey');
  }

  private getCookieCryptoKey() {
    if (!this.checkCookie()) {
      this.cookieService.set('cryptokey', this.generateCryptoKey(), 365, '/');
    }
    return this.cookieService.get('cryptokey');
  }

  private generateCryptoKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
  }

  private deCrypt(value) {
    if (value == null) {
      return value;
    }
    return this.simpleCrypto.decrypt(value);
  }

  public setAppToken(token) {
    this.storage.set('apptoken', this.simpleCrypto.encrypt(token));
  }

  public async getAppToken() {
    return await this.storage.get('apptoken')
      .then(token => {
        return this.deCrypt(token);
      });
  }

  public setSessionToken(token) {
    this.storage.set('sessiontoken', this.simpleCrypto.encrypt(token));
  }

  public async getSessionToken() {
    return await this.storage.get('sessiontoken')
      .then(token => {
        return this.deCrypt(token);
      });
  }

  public setURL(glpiURL) {
    this.storage.set('glpiURL', glpiURL);
  }

  public getURL() {
    return this.storage.get('glpiURL');
  }

}
