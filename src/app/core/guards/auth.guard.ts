import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { UserSession } from '../models/user-session.model';
import { DOCUMENT } from '@angular/common';
import { LoginService } from 'src/app/features/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private _loginService: LoginService,
    @Inject(DOCUMENT) private document: Document,

  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let authRequired: any = false;
    try {
      authRequired = route.routeConfig?.data ? route.routeConfig?.data['auth'] : false;
    } catch (e) {

    }

    this._loginService.setLogin.next(true)
    
    //Clear out the session if auth isn't required, in case of lingering session storage
    if (!authRequired) {
      return true;
    }

    //Redirect to login if token is not valid

    //Get user session from session storage
    const userSession: UserSession = this.authService.getUserSession();

    if (!this.authService.isAuthorized(userSession)) {
      // Redirect to same url after login for SRF
  
      if(state.url.includes('srf-link')) {
        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
          const verificationCode = state.root.queryParams['verificationCode'] || '';
          this.document.location.href = `com.qpharma.qpharmarx://srf-link?verificationCode=${verificationCode}`
          return false;
        }
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }


    if (this.isProfileCompletionRouteActive()) {
      if (route.routeConfig.path === "security") {
        return true
      } else {
        this.router.navigate(['security']);
      }
    }

    const id = route.queryParams['id'] || null;
    if(route.routeConfig?.path === 'products' && this.commonService.getisBrandEnable() && !id) {
      this.router.navigate(['brands'])
    }
    return true;
  }

  canLoad(route: Route): boolean {
    const userSession: UserSession = this.authService.getUserSession();
    if (!this.authService.isAuthorized(userSession)) {
      return false;
    }
    return true;
  }


  isProfileCompletionRouteActive() {
    const accountData = this.authService.getUserSession();
    if (accountData.userAccount?.displayChangePasswordScreen === 'Y') {
      return true;
    } else if (accountData.userAccount?.displaySetSecurityQuestionScreen === 'Y') {
      return true;
    } else if (accountData.userAccount?.displaySetPinScreen === 'Y') {
      return true;
    } else {
      return false;
    }
  }

}

