import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from 'src/app/core/utilities/constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(private _httpClient : HttpClient) { }

  public getFaq(): Observable <any> {
    return this._httpClient.get(`${environment.apiEndpoint}/Configuration/GetFAQ`, {
      headers: new HttpHeaders({
      [Constants.INTERCEPTOR_SKIP_HEADER]: '',
  })
})
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }
}
