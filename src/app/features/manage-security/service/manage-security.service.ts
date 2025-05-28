/* eslint-disable prettier/prettier */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePINResponse } from 'src/app/core/models/security.model';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageSecurityService {

  constructor(private _httpClient: HttpClient) { }

  public addSecurityQuestion(params) {
    return this._httpClient.post(`${environment.apiEndpoint}/Account/SetSecurityQuestion`, params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public setPassword(params) {
    return this._httpClient.post(`${environment.apiEndpoint}/Account/ChangePassword`, params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public addPin(params) {
    return this._httpClient.post(`${environment.mockApiEndpoint}/Users/AddPin`, params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public createPin(params): Observable<CreatePINResponse> {
    return this._httpClient.post(`${environment.apiEndpoint}/Account/CreatePin`, params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public getClientPolicies() {
    return this._httpClient.get(`${environment.apiEndpoint}/Configuration/GetClientSecurityPolicies`)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        }
      );
  }

  public getClientSecurityQuestions() {
    return this._httpClient.get(`${environment.apiEndpoint}/Account/GetSecurityQuestions`)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        }
      );
  }

  public getClientSecurityPolicies() {
    //need to pass access token in header
    return this._httpClient.get(`${environment.apiEndpoint}/Configuration/GetClientSecurityPolicies`);
  }

  public changePin(params) {
    return this._httpClient
      .post(`${environment.apiEndpoint}/Account/ChangePin`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  
  public verifyPin(params) {
    return this._httpClient
      .post(`${environment.apiEndpoint}/Account/VerifySecurityAnswer`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public getAddress(): Observable<any> {
    return this._httpClient
      .get(`${environment.apiEndpoint}/Address/GetAddresses`)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public deleteAddress(params): Observable<any> {
    return this._httpClient
      .delete(`${environment.apiEndpoint}/Address/DeleteAddress`, {
        body: {
          LocationId: params,
        }
      })
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public addAddress(params): Observable<any> {
    return this._httpClient
      .post(`${environment.apiEndpoint}/Address/AddAddress`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }

  public editAddress(params): Observable<any> {
    return this._httpClient
      .put(`${environment.apiEndpoint}/Address/UpdateAddress`, params)
      .pipe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          return error;
        }
      )
  }
}
