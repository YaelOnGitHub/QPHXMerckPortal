/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { SessionStorageService } from 'angular-web-storage';
import { UserSession } from 'src/app/core/models/user-session.model';
import { Constants } from 'src/app/core/utilities/constants';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AuthResponse, RefreshToken, SocialAccountVerificationResponse, SocialLoginRequest, SocialLoginResponse, UserAccount } from 'src/app/core/models/auth.model';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { CookieManagementService } from '../cookie-management.service';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import jwt_decode from 'jwt-decode';
import { CommonService } from '../common-service/common.service';
import { v4 as uuidv4 } from 'uuid';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';

interface LoginError {
  errorMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  
  public userSessionStream: BehaviorSubject<UserSession> = new BehaviorSubject<UserSession>(this.getUserSession());
  public userSessionStream$ = this.userSessionStream.asObservable();

  public isFirstLoad : boolean = true;
  public isLandingPage: boolean = false;
  public isLoginPage: boolean = false;
  userSession: UserSession = this.userSessionStream.value;
  public jwtHelper: JwtHelperService = new JwtHelperService();
  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private session: SessionStorageService,
    private _toastr: ToastrService,
    private _cookieService:CookieManagementService,
    private _socialAuthService: SocialAuthService
  ) { }

  setFirstLoad(val:boolean) {
    this.isFirstLoad = val
  }

  setIsLandingPage(val:boolean) {
    this.isLandingPage = val
  }

  setIsLoginPage(val:boolean) {
    this.isLoginPage = val
  }

  login(authRequest): Observable<AuthResponse> {
    return this._httpClient
      .post<any>(
        `${environment.apiEndpoint}/Auth/token`,
        {
          ...authRequest
        },
        {
          headers: new HttpHeaders({
            [Constants.INTERCEPTOR_SKIP_HEADER]: ''
          }),
        }
      )
      .pipe(
        map((authResponse) => {
          let authResponseData = authResponse.data;
          if (authResponse.success) {
            this.saveUserSession(authResponseData);
            return authResponse;
          } else {
            return authResponse;
          }
        }),
        catchError(this.formatErrors.bind(this))
        );
  }

  private formatErrors(error: any) {
   return throwError(error)
  }

  getAccountDetails(): Observable<UserAccount> {
    return this._httpClient
      .get<UserAccount>(
        `${environment.apiEndpoint}/Account/GetDetails`,
      )
      .pipe(
        map((accountDetails) => {
          if (accountDetails.success) {
            let userAccount = accountDetails.data;
            let userSession = {
              ...this.getUserSession(),
              userAccount
            };
            this.saveUserSession(userSession);
            return accountDetails;
          } else {
            return accountDetails;
          }
        }),
        catchError((_err, caught) => {
          return EMPTY;
        })
      );
  }

  saveUserSession(authResponseData) {
    const uniqueSessionId = uuidv4();
    const newUserSession: UserSession = new UserSession(authResponseData);
    newUserSession.userAccount = authResponseData?.userAccount ? authResponseData?.userAccount : null;
    newUserSession.expires = moment(new Date()).add(newUserSession.expiresIn, 'seconds').toDate();
    newUserSession.uniqueSessionId = uniqueSessionId;
    this.session.set(Constants.USER_SESSION_DATA_KEY, newUserSession);
    this.setUserSessioninCookie(newUserSession)
    this.userSessionStream.next(new UserSession(newUserSession));
  }

  getUserSession(): UserSession {
    let newUserSession: UserSession = new UserSession(this.session.get(Constants.USER_SESSION_DATA_KEY));
    if((newUserSession && Object.keys(newUserSession).length === 0)) {
      const result = new UserSession(this._cookieService.getUserSessionCookie('userSession'))
      return result;
    }
    return newUserSession;
  }

  setUserSessioninCookie(userSession) {
    this._cookieService.setCookie(userSession,'userSession')
  }

  getUserConfiguration() {
    let getUserConfiguration = this.session.get(Constants.USER_SESSION_CLIENT_CONFIG_KEY);
    return getUserConfiguration;
  }

  isJWT(token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken.hasOwnProperty('exp');
    } catch (e) {
      return false;
    }
  }

  getSocialMediaLoginInfo() {
    if(this.getUserSession().accessToken && this.isJWT(this.getUserSession().accessToken)) {
      const token :any = jwt_decode(this.getUserSession().accessToken) || ''
      return token.LoginType?.toLowerCase() || ''
    }
    return '';
  }

  endSession(isToastrShow = true): void {
    let clientConfig = this.session.get('clientConfig');
    let isQphma = clientConfig[0].clientId == APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false; 
    // deleting userSesison from cookie
    this._cookieService.deleteCookie('userSession')
    this._cookieService.deleteAllCookie();

    // signout from social media if any
    if(this.getSocialMediaLoginInfo() !== 'manual') {
      this._socialAuthService.signOut(true).then().catch((err)=>{})
    }

    this.session.remove('userSession');
    this.session.remove('oldPassword');
    this.session.remove('stateList');
    this.session.remove('specialityList');
    this.session.remove('designationList');
    this.session.remove('isTargetHCP');
    this.session.remove('cartStore');
    this.session.remove('brandWarningBox');
    this.session.get('clientConfig');
    sessionStorage.removeItem('hasBlockerAoc');
    localStorage.removeItem('firstLogin');
    localStorage.removeItem('firstBrandsLogin');
    

    if (isToastrShow) {
      this._toastr.success('You have been logged out successfully');
    }
    
    if(isQphma){
      this._router.navigateByUrl('/');
    }
    else{
      this._router.navigateByUrl('/login');
    }
   
    this.userSessionStream.next(new UserSession);
  }

  isAuthorized(userSession: UserSession): boolean {
    return userSession && !!userSession.accessToken;
  }

  refreshToken(tokenRequest: RefreshToken): Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/Auth/refresh`,
      tokenRequest,
      {
        headers: new HttpHeaders({
          [Constants.INTERCEPTOR_SKIP_HEADER]: ''
        }),
      })
  }

  socialAccountInit(socialAuthRequest): Observable<SocialAccountVerificationResponse> {
    return this._httpClient
      .post<any>(
        `${environment.apiEndpoint}/SocialAuth/SocialAccountInit`,
        {
          ...socialAuthRequest
        },
        {
          headers: new HttpHeaders({
            [Constants.INTERCEPTOR_SKIP_HEADER]: ''
          }),
        }
      )
      .pipe(
        map((response) => {
          let responseData = response.data;
          if (response.success) { 
            return response;
          }
        }),
        catchError((_err, caught) => {
          return EMPTY;
        })
      );
  }

  socialLogin(socialAuthRequest: SocialLoginRequest): Observable<SocialLoginResponse> {
    return this._httpClient
      .post<any>(
        `${environment.apiEndpoint}/SocialAuth/SocialLogin`,
        {
          ...socialAuthRequest
        },
        {
          headers: new HttpHeaders({
            [Constants.INTERCEPTOR_SKIP_HEADER]: ''
          }),
        }
      )
      .pipe(
        map((socialLoginRespons) => {
          let socialLoginResponseData = socialLoginRespons.data;
          if (socialLoginRespons.success) {
            this.saveUserSession(socialLoginResponseData);
            return socialLoginRespons;
          } else {
            return socialLoginRespons;
          }
        }),
        catchError((_err, caught) => {
          return EMPTY;
        })
      );
  }

  deactivateAccount(firstName,lastName,designation) {
    return this._httpClient.delete(`${environment.apiEndpoint}/SocialAuth/SocialDeactiveAccount?firstName=${firstName}&lastName=${lastName}&designation=${designation}`,{body: {}}).pipe(
      (response: any) => {
        return response;
      }, (error: any) => {
        return error;
      });
  }
}
 