/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductList } from 'src/app/core/models/product-details.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  filterArray: Array<any> = [];

  public productFilterStream: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
  public productFilterStream$ = this.productFilterStream.asObservable();

  public filterManufacturerList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public filterManufacturerListStream$ = this.filterManufacturerList.asObservable();

  public selectedCardList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public selectedCardListStream$ = this.selectedCardList.asObservable();


  constructor(private _httpClient: HttpClient) { }

  public getProductList(productRequestParam): Observable<ProductList> {
    return this._httpClient.post(`${environment.apiEndpoint}/Products/FetchProducts`, {
      ...productRequestParam
    })
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }


  resetFilter() {
    this.filterArray = [];
    this.productFilterStream.next(true);
  }

  clearFilters() {
    this.filterArray = []
    this.productFilterStream.next(false)
  }

  getFilters() {
    return this.filterArray;
  }

  setFilters(filter) {
    this.filterArray = filter;
    this.productFilterStream.next(true);
  }

  getManufacturerFilters() {
   return this._httpClient.get(`${environment.apiEndpoint}/Lookup/GetMultiTenantClients`)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }
  getProductFilters() {
    return this._httpClient.get(`${environment.apiEndpoint}/Products/GetProductFilters`)
       .pipe(
         (response: any) => {
           return response;
         }, (error: any) => {
           return error;
         });
   }
}
