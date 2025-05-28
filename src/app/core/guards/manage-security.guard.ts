/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { UserSession } from '../models/user-session.model';

@Injectable({
    providedIn: 'root'
})
export class ManageSecurityGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        //Get user session from session storage
        const userSession: UserSession = this.authService.getUserSession();
        if (userSession.userAccount) {

            if (userSession.userAccount[route.data['displayChangePasswordScreen']] == 'Y') {
                return true;
            }
            else if (userSession.userAccount[route.data['displaySetSecurityQuestionScreen']] === 'Y') {
                return true;
            }
            else if (userSession.userAccount[route.data['displaySetPinScreen']] === 'Y') {
                return true;
            } else {
                if (route.data['redirect'] !== 'products') {
                    this.router.navigateByUrl('/security/' + route.data['redirect']);
                } else {
                    this.router.navigateByUrl(route.data['redirect']);
                }

                return false;
            }

        }
        return false;
    }

}

