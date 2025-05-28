/* eslint-disable prettier/prettier */
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
    HttpResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { catchError, delay, filter, mergeMap, retry, switchMap, take, tap } from 'rxjs/operators';
import { ClientSpecification } from '../services/client-specification.service';
import { LocalRegions } from '../utilities/localRegions';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { Constants } from '../utilities/constants';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { Router } from '@angular/router';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';


@Injectable()
export default class AuthInterceptor implements HttpInterceptor {
    private apiCounter = 0;
    clientSpecification_Setting: any;
    private isRefreshing = false;
    private readonly maxRetryAttempts = 1; // Maximum number of retry attempts
    private readonly retryDelay = 2000; // Delay between retries in milliseconds
    public jwtHelper: JwtHelperService = new JwtHelperService();
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private _router: Router, private injector: Injector, private toastrService: ToastrService, private authService: AuthService,
      private clientSpecification: ClientSpecification, private alertService: AlertService, private loader: LoaderService,
      private _cartManagementService: cartManagementService, private _alertService:AlertService, private _commonService: CommonService) {
        this.clientSpecification_Setting = this.clientSpecification.getSetting();
    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let userSession = this.authService.getUserSession();

        this.loader.show(request);
        
        if (request.headers.has(Constants.INTERCEPTOR_SKIP_HEADER)) {
            return next.handle(
                request = this.addTokenHeader(request, userSession.accessToken, false, true)
            ).pipe(
                tap(evt => {
                    if (evt instanceof HttpResponse) {
                        if (evt != null) {
                            this.loader.hideLoader(request)
                        }
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    this.loader.hideLoader(request)
                    if(error && this.checkURL(error)) {
                      return throwError(error)
                    } else {
                    return this.handleError(error);
                    }
                })
            )
        }

        if (!this.authService.isAuthorized(userSession)) {
            return this.handle401Error(request, next);
        }

        request = this.addTokenHeader(request, userSession.accessToken, true, false)


        return next.handle(request).pipe(
            tap(evt => {
                if (evt instanceof HttpResponse) {
                    if (evt != null) {
                      this.loader.hideLoader(request)
                    }
                }
            }),
            catchError((err: HttpErrorResponse) => {
                this.loader.hideLoader(request)
                if (err.status === 401) {
                    return this.handle401Error(request, next);
                } else if (err.status === 504) {
                  console.log(err.status)
                  return this.handleRetry(request, next); // Retry the request for 504 error / Timeout Gateway
                } else {
                  return this.handleError(err);
                }
            })
        );
    }

    checkURL(err) {
      let path = err.url;
      path = path.split('/')
      if(path[path.length -1] == 'token') {
        return true
      }
      return false
    }

    private handleRetry (request: HttpRequest<any>, next: HttpHandler) {
      let retryAttempt = 0;
      return next.handle(request).pipe(
        retry(this.maxRetryAttempts), // Retry the request a maximum of `maxRetryAttempts` times
        delay(this.retryDelay), // Delay between retry attempts
        mergeMap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Response was successful, no need to retry
            return of(event);
          }
          return throwError(() => event); // Throw the event to trigger retry
        }),
        catchError((error: HttpErrorResponse) => {
          console.log("errr",error)
          if (retryAttempt < this.maxRetryAttempts && error.status === 504) {
            retryAttempt++;
            return throwError(() => error); // Throw the error to trigger retry
          }
          return this.handleError(error); // Rethrow the error if it's not a 504 error or exceeded max retries
        }),
        take(this.maxRetryAttempts) // Take only `maxRetryAttempts` attempts
      );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);
            const userSession = this.authService.getUserSession();
            if (userSession.refreshToken)
            {
                //this.authService.endSession();
                return this.authService.refreshToken({
                    refreshToken: userSession.refreshToken,
                    LoginType: this.authService.getSocialMediaLoginInfo() || 'manual'
                }).pipe(
                    switchMap((authResponse: any) => {
                        let authResponseData = authResponse.data;
                        if (authResponse.success) {
                            this.isRefreshing = false;
                            this.refreshTokenSubject.next(authResponseData.accessToken);
                            this.authService.saveUserSession(authResponseData);
                            this.authService.getAccountDetails().subscribe();
                            this.redirectProfileDefaultPage();
                            return next.handle(this.addTokenHeader(request, authResponseData.accessToken, true, false))
                        } else {
                            return next.handle(this.addTokenHeader(request, authResponseData.accessToken, true, false))
                        }
                    }),
                    catchError((err) => {
                        console.log('exception while handle401Error',err);
                        this.isRefreshing = false;
                        this.authService.endSession(true);
                        this._cartManagementService.clearProductStore()
                        this._alertService.closeAllModals();
                        return throwError(() => { err })
                    })
                );
            }
        }


        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token, true, false)))
        );

    }



    private handleError(err: HttpErrorResponse) {
        const customErrorMessage = "Something went wrong";
        let errorMessage = err?.error?.message ? err.error?.message : 'Something went wrong';

        const isShowToastr = (err?.error?.message && err?.error?.message === 'Invalid Token claims.')
                               || (err?.error?.apiMessageCode === 'BAD_REQUEST_INVALID_TDDD') ? false : true;


       
        if(isShowToastr  && errorMessage != customErrorMessage)
        {
            this.toastrService.error(errorMessage)
            const activityLogData = this.generateRequestData(errorMessage, err.url);
            this._commonService.addUserActivity(activityLogData).subscribe({
                next: response => {
                  console.log('User activity logged successfully', response);
                },
                error: error => {
                  console.error('Error logging user activity', error);
                },
                complete: () => {
                  //this.loader.hideLoader();
                  console.log('User activity logging complete');
                }
              });
        }
   
       // return throwError(() => { errorMessage });

        return throwError(() => ({
          errorMessage: errorMessage,
          apiMessageCode: err?.error?.apiMessageCode
        }));
        
          
        
    }

    private generateRequestData(reqBody: string, url: string){

        let [actionName, queryString] = this._commonService.getUrlQueryStringAndActionName(url);
    
        let activityMetaData = JSON.stringify(reqBody) ?? queryString;
        if(!activityMetaData){
          activityMetaData = "NA";
        }

        actionName = `${actionName}-Error`;
    
        const activityLogData = {
            activityMetaData: activityMetaData,
            action: actionName
          };
    
        return activityLogData;
      }

    private addTokenHeader(request: HttpRequest<any>, token: string, authorization: boolean, skipHeader: boolean) {
        let HEADERS = {
            // 'X-Client-Id': this.clientSpecification_Setting.CLIENT_ID,
            // 'X-Project-Id': this.clientSpecification_Setting.PROJECT_ID,
            'Accept-Language': LocalRegions.getUserLocal().language,
            'Content-Type': 'application/json',
            'Session-Id': this.authService?.getUserSession()?.uniqueSessionId ?? '',

        }

        const authorizationToken = authorization ? { authorization: `Bearer ${token}` } : { authorization: `Basic ${this.clientSpecification_Setting.NON_AUTH_API_TOKEN}` };

        const requestObj = request.clone({
            ...(skipHeader ? { headers: request.headers.delete(Constants.INTERCEPTOR_SKIP_HEADER) } : null),
            setHeaders: {
                ...HEADERS,
                ...authorizationToken
                //...(authorization ? { authorization: `Bearer ${token}` } : { authorization: `Basic ${this.clientSpecification_Setting.NON_AUTH_API_TOKEN}` }),
            }
        });
        return requestObj;


    }

    private redirectProfileDefaultPage() {
        this._router.navigateByUrl('/manage/profile');
    }
}
