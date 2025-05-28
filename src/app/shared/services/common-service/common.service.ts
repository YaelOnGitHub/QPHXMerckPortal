/* eslint-disable prettier/prettier */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Designation, StatesResponse } from 'src/app/core/models/common.model';
import { UserSession } from 'src/app/core/models/user-session.model';
import { Constants } from 'src/app/core/utilities/constants';
import { LocalRegions } from 'src/app/core/utilities/localRegions';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth-service/auth.service';

const countryRegion = LocalRegions.getUserLocal().region;


@Injectable({
  providedIn: 'root',
})

export class CommonService {
  isBrandEnable: boolean = false;
  isSocialMediaEnable: boolean = false;
  private licenseArray = [];

  constructor(private _httpClient: HttpClient, private _authService: AuthService, private _router: Router) { 
    console.log("Initialize CommonService by constructor");
    let configList = this._authService.getUserConfiguration();
    const brandInfo = configList?.find(el => el.settingKey === 'ALLOW_BRANDING');
    const socialMediaInfo = configList?.find(el => el.settingKey === 'ALLOW_SOCIAL_LOGIN');
    this.isBrandEnable = brandInfo?.keyValue.toLowerCase() == 'true' ? true : false;
    this.isSocialMediaEnable = socialMediaInfo?.keyValue.toLowerCase() == 'true' ? true : false;

  }

  init(){

    console.log("Initialize CommonService by Init");
    let configList = this._authService.getUserConfiguration();
    const brandInfo = configList?.find(el => el.settingKey === 'ALLOW_BRANDING');
    const socialMediaInfo = configList?.find(el => el.settingKey === 'ALLOW_SOCIAL_LOGIN');
    this.isBrandEnable = brandInfo?.keyValue.toLowerCase() == 'true' ? true : false;
    this.isSocialMediaEnable = socialMediaInfo?.keyValue.toLowerCase() == 'true' ? true : false;

  }

  public getDesignationList(): Observable<Designation> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/Lookup/GetProfileDesignations`, {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: '',
        }),
      })
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      );
  }

  public getStateList(): Observable<StatesResponse> {
    return this._httpClient
      .get(
        `${environment.apiEndpoint}/Lookup/GetCountryStates?CountryCode=US`,
        {
          headers: new HttpHeaders({
            [Constants.INTERCEPTOR_SKIP_HEADER]: '',
          }),
        }
      )
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      );
  }

  public getSpecialityList(): Observable<any> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/Lookup/GetHcpSpecialtyCodes`, {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: '',
        }),
      })
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      );
  }

  public getClientSecurityPolicies(): Observable<any> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/Configuration/GetClientSecurityPolicies`)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      );
  }

  public getLicenses(): Observable<any> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/License/GetLicenses`)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public getSubscriptions(): Observable<any> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/Products/GetSubscriptions`)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public cancelSubscriptions(params): Observable<any> {
    return this._httpClient
      .post(`${environment.apiEndpoint}/Products/CancelSubscription`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public addLicense(params): Observable<any> {
    return this._httpClient
      .post(`${environment.apiEndpoint}/License/AddLicense`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public getHCPFullName() {
    const userSession: UserSession = this._authService.getUserSession();
    let fullName = userSession.userAccount['firstName'] + ' ' + userSession.userAccount['lastName']
    return fullName;
  }

  public getLicenseArray() {
    return this.licenseArray;
  }

  public setLicenseArray(license) {
    this.licenseArray = license;
  }

  public getisBrandEnable() {
    return this.isBrandEnable
  }

  public getisSocialMediaEnable() {
    return this.isSocialMediaEnable
  }

  public generateGUID(): string {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }


  public redirectActivatedRoute() {
    // this.isBrandEnable = false;
    console.log(`Branding: ${this.isBrandEnable}`)
    this.isBrandEnable ? this._router.navigateByUrl('/brands') : this._router.navigateByUrl('/products');
  }

  public getUrlQueryStringAndActionName(url: string){
        // Split the URL to get the path and query string
        const [path, queryString] = url.split('?');

        // Split the path to get the action name
        const segments = path.split('/');
        const actionName = segments[segments.length - 1];

        return [actionName,queryString];

  }

  public addUserActivity(params): Observable<any> {
    let headers = new HttpHeaders();
    const userSession = this._authService.getUserSession();
    if (!this._authService.isAuthorized(userSession)) {
        headers = headers.set(Constants.INTERCEPTOR_SKIP_HEADER, '');
    }
    return this._httpClient
      .post(`${environment.apiEndpoint}/UserLog/add`, params, { headers: headers }
      //.post(`https://localhost:7203/api/UserLog/add`, params,
      )
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          console.log(error);
          return error;
        }
      )
  }

}
