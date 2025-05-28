/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { ManageSecurityService } from './manage-security.service';

@Injectable({
    providedIn: 'root',
})
export class ClientSecurityPoliciesResolver implements Resolve<any> {
    constructor(private _manageSecurityService: ManageSecurityService) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return this._manageSecurityService.getClientSecurityPolicies()
            .pipe(
                map(
                    result => {
                        return {
                            clientSecurityPolicyData: result
                        }
                    }
                ),
                catchError(error => {
                    return of('No data');
                })
            );
    }
}
