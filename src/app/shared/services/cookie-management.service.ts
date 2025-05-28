import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { UserSession } from 'src/app/core/models/user-session.model';

@Injectable({
  providedIn: 'root'
})
export class CookieManagementService {

  constructor(private _cookieService:CookieService) { }

  setCookie(data,key:string) {
    const cookie = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
    this._cookieService.set(key, cookie, undefined, '/')
  }

  getCookieFromIOS(key) {
    const data = this._cookieService.get(key)
    if (data == '') return {}
    const iv = '7f92af0e48d6349c';
    const encryptedBytes = CryptoJS.enc.Base64.parse(data);
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    let cookie = CryptoJS.AES.decrypt({ciphertext: encryptedBytes}, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    cookie = JSON.parse(cookie.toString(CryptoJS.enc.Utf8));
    return cookie;
  }

  getCookie(key) {
    const data = this._cookieService.get(key)
    if (data == '') return {}
    let cookie = CryptoJS.AES.decrypt(data, key);
    cookie = JSON.parse(cookie.toString(CryptoJS.enc.Utf8));
    return cookie
  }

  deleteCookie(key) {
    this._cookieService.delete(key,'/')
  }

  deleteAllCookie() {
    const domain = window.location.hostname;
    this._cookieService.deleteAll('/', domain);       
  }

  getUserSessionCookie(userSession): UserSession {
    const data = this._cookieService.get(userSession)
    if (data == '') {
      return {} as UserSession
    }

    let session = CryptoJS.AES.decrypt(data, 'userSession');
    session = JSON.parse(session.toString(CryptoJS.enc.Utf8));
    return session
  }
  
}


