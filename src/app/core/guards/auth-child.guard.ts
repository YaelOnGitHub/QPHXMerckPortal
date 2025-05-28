import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { UserSession } from '../models/user-session.model';

@Injectable({
  providedIn: 'root'
})
export class AuthChildGuard implements CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let authRequired = false;
    try {
      authRequired = route.routeConfig?.data ? route.routeConfig?.data['auth'] : false;
    } catch (e) {

    }

    //Clear out the session if auth isn't required, in case of lingering session storage
    if (!authRequired) {
      return true;
    }

    //Get user session from session storage
    const userSession: UserSession = this.authService.getUserSession();

    if (!this.authService.isAuthorized(userSession)) {
      //TODO: redirect to error page and ask to login again
      this.router.navigate(['page-not-found']);
      return false;
    }

    return true;
  }

}
