/* eslint-disable prettier/prettier */
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { Constants } from "../utilities/constants";
import { catchError, Observable } from "rxjs";
import { TranslateLoader } from "@ngx-translate/core";

@Injectable({
    providedIn: "root"
})
export class CustomLoader implements TranslateLoader {

    constructor(private http: HttpClient) { }

    getTranslation(lang: string): Observable<any> {
        const apiAddress = `${environment.translationApiEndpoint}/${lang}.json`;
        return this.http.get(apiAddress, {
            headers: new HttpHeaders({
                [Constants.INTERCEPTOR_SKIP_HEADER]: '',
            })
        }).pipe(
            catchError(_ => { return this.http.get(`/assets/i18n/en.json`) })
        )
    }
}