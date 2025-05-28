import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocialVerifyLinkResponse } from 'src/app/core/models/auth.model';
import { Constants } from 'src/app/core/utilities/constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocialAccountConfirmationService {

  constructor(private _httpClient : HttpClient) { }

  public verifySocialMediaLink(socialLink: any): Observable<SocialVerifyLinkResponse> {
    return this._httpClient.post<SocialVerifyLinkResponse>(`${environment.apiEndpoint}/SocialAuth/SocialVerifyLink`,
    socialLink,
      {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: ''
        }),
      })
  }


  public resendConfirmationLink(email: any): Observable<SocialVerifyLinkResponse> {
    return this._httpClient.post<SocialVerifyLinkResponse>(`${environment.apiEndpoint}/SocialAuth/SocialResendConfirmationLink`,
    email,
      {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: ''
        }),
      })
  }
}
