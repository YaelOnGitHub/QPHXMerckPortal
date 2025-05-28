import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forgotPasswordResponse } from 'src/app/core/models/forgot-password.model';
import { Constants } from 'src/app/core/utilities/constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  constructor(private _httpClient: HttpClient) { }


  public forgotPassword(params): Observable<forgotPasswordResponse> {
    return this._httpClient.post(`${environment.apiEndpoint}/Account/ForgotPassword`, params,
      {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: '',
        }),
      })
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }
}
