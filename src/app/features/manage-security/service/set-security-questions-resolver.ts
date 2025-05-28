/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { ManageSecurityService } from './manage-security.service';

@Injectable({
    providedIn: 'root'
})
export class SetSecurityQuestionsResolver implements Resolve<any>{

    constructor(private _manageSecurityService: ManageSecurityService) { }

    resolve(): Observable<any> {
        return this._manageSecurityService.getClientSecurityQuestions()
            .pipe(
                map(result => {
                    return {
                        data: result
                    }
                }),
                catchError((error) => {
                    return of('No data');
                })
            )
    }
}
