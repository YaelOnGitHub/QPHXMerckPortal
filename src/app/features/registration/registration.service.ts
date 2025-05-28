/* eslint-disable prettier/prettier */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HCPSearchRequest, HCPSearchResponse } from 'src/app/core/models/registration.model';
import { Constants } from 'src/app/core/utilities/constants';
import { HCP_Details, RegistrationFormModel, RegistrationSaveResponse } from 'src/app/features/registration/registration-form.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    _httpClient: HttpClient;

    private hcpSearchData: any;
    private getSearchedHCPRecords = new BehaviorSubject<HCPSearchResponse>(null);
    public getSearchedHCPRecords$ = this.getSearchedHCPRecords.asObservable();
    private isTarget: boolean;

    constructor(httpClient: HttpClient) {
        this._httpClient = httpClient;
    }

    public searchHCP(searchParams: HCPSearchRequest): Observable<HCPSearchResponse> {
        return this._httpClient.post(`${environment.apiEndpoint}/Registration/SearchRegistration`, searchParams, {
            headers: new HttpHeaders({
                [Constants.INTERCEPTOR_SKIP_HEADER]: '',
            })
        })
            .pipe(
                (response: any) => {
                    this.getSearchedHCPRecords.next(response);
                    return response;
                }, (error: any) => {
                    return error;
                });
    }

    public searchHCPByID(id, isTarget=false): Observable<HCP_Details> {
        return this._httpClient.get<any>(`${environment.apiEndpoint}/Registration/GetHcpDetailsById?HcpIdentifier=${id}&isTarget=${isTarget}`, {
            headers: new HttpHeaders({
                [Constants.INTERCEPTOR_SKIP_HEADER]: '',
            })
        });
    };

    public submitRegistration(submissionObject: RegistrationFormModel): Observable<RegistrationSaveResponse> {
        return this._httpClient.post<any>(`${environment.apiEndpoint}/Registration/SaveRegistration`, submissionObject, {
            headers: new HttpHeaders({
                [Constants.INTERCEPTOR_SKIP_HEADER]: '',
            })
        });
    };

    public setIsTarget(isTarget) {
        this.isTarget = isTarget;
    }

    public getIsTarget() {
        return this.isTarget;
    }

    public setHCPSearchData(data) {
      this.hcpSearchData = data;
    }

    public getHCPSearchData() {
      return this.hcpSearchData;
    }
}
