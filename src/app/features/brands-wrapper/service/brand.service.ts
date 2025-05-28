import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(private _httpClient: HttpClient) { }

  public getBrandList(brandRequestParam): Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/Brands/FetchBrands`, {
      ...brandRequestParam
    })
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

}
