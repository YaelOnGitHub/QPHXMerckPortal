/* eslint-disable prettier/prettier */
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { Constants } from "../utilities/constants";
import { APP_CLIENTS, ClientSpecification } from "./client-specification.service";
import { OneTrustService } from "@altack/ngx-onetrust";
import { AuthService } from "src/app/shared/services/auth-service/auth.service";

@Injectable({
    providedIn: "root"
})
export class AppInitService {

    constructor(private _httpClient: HttpClient, private oneTrust: OneTrustService, private _authService: AuthService,
        private _cs: ClientSpecification) {}

    init() {
        this._cs.setSetting();
        return this._httpClient.get(`${environment.apiEndpoint}/Configuration/GetClientConfig`, {
            headers: new HttpHeaders({
                [Constants.INTERCEPTOR_SKIP_HEADER]: '',
            })
        })
    }

    public loadCookieScript() {
      let configList = this._authService.getUserConfiguration();
      if(configList && configList[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID) {
        this.oneTrust.loadOneTrust();
      }
    }
  
}