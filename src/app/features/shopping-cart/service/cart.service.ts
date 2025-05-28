/* eslint-disable prettier/prettier */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderSubmissionResponse, OrderSubmissionMultiTenantResponse, ProductTermsConditions,PreferredDeliveryDay } from 'src/app/core/models/order-submission.model';
import { environment } from 'src/environments/environment';

interface CartObject {
    id: string,
    count: number
}



@Injectable({
    providedIn: 'root'
})
export class CartService {

    cartRecord: CartObject[] = [];

    public cartTermsAndConditionsValidStream: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
    public cartTermsAndConditionsValidStream$ = this.cartTermsAndConditionsValidStream.asObservable();

    public cartAtLeastOneProductItemValidStream: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
    public cartAtLeastOneProductItemValidStream$ = this.cartAtLeastOneProductItemValidStream.asObservable();

    public cartAtLeastOneAddressValidStream: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
    public cartAtLeastOneAddressValidStream$ = this.cartAtLeastOneAddressValidStream.asObservable();

    public cartGetSelectedAddress: BehaviorSubject<any> = new BehaviorSubject<any>({});
    public cartGetSelectedAddress$ = this.cartGetSelectedAddress.asObservable();

    public tdddExempt: BehaviorSubject<any> = new BehaviorSubject<any>({});
    public tdddExempt$ = this.tdddExempt.asObservable();

    public tddModalSaved: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public tddModalSaved$ = this.tddModalSaved.asObservable();

    public srfDeliveryModalSaved: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public srfDeliveryModalSaved$ = this.srfDeliveryModalSaved.asObservable();

    public isAddressWarning: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public isAddressWarning$ = this.isAddressWarning.asObservable();

    public addressLocId: string;
    public addressItem: any;
    public fax:string;

    constructor(private _httpClient: HttpClient) { }

    updateCart(cartObj) {
        this.cartRecord?.map(entry => {
            if (entry.id === cartObj.id) {
                entry.count = cartObj.count;
            }
        })
    }

    getCartCount() {
        let count = 0;
        this.cartRecord?.map(entry => {
            count += entry.count;
        })
        return count;
    }

    addToCart(cartObj) {
        const checkIdInCart = product => product.id === cartObj.id;
        if (this.cartRecord.some(checkIdInCart)) {
            this.updateCart(cartObj)
        }
        else {
            this.cartRecord.push(cartObj);
        }
    }


    onPlaceSingleManufactureOrder(params): Observable<OrderSubmissionResponse> {
        return this._httpClient
            .post(`${environment.apiEndpoint}/Orders/PlaceOrder`, params)
            .pipe(
                (response: any) => {
                    return response;
                },
                (error: any) => {
                    return error;
                }
            )
    }

    onPlaceMultiManufactureOrder(params): Observable<OrderSubmissionMultiTenantResponse> {
        return this._httpClient
            .post(`${environment.apiEndpoint}/Orders/PlaceOrderSplit`, params)
            .pipe(
                (response: any) => {
                    return response;
                },
                (error: any) => {
                    return error;
                }
            )
    }

    getTDDDNumber(params): Observable<any> {
      return this._httpClient
      .get(`${environment.apiEndpoint}/tddd?addressLocationId=`+params)
      .pipe(
          (response: any) => {
              return response;
          },
          (error: any) => {
              return error;
          }
      )
    }

    getProductsTermsConditions(params): Observable<ProductTermsConditions> {
        return this._httpClient
            .post(`${environment.apiEndpoint}/Products/FetchProductTermsConditions`, params)
            .pipe(
                (response: any) => {
                    return response;
                },
                (error: any) => {
                    return error;
                }
            )
    }
    
    getPreferredDeliveryDate(params): Observable<PreferredDeliveryDay> {
        return this._httpClient
            .get(`${environment.apiEndpoint}/ProjectedDelivery?deliveryDays=`+params )
            .pipe(
                (response: any) => {
                    return response;
                },
                (error: any) => {
                    return error;
                }
            )
    }

    setSelectedAddress(addressLocId) {
        this.addressLocId = addressLocId;
    }

    setSelectedAddressItem(address) {
        this.addressItem = address
    }

    setFax(fax) {
        this.fax = fax
    }

    getFax() {
        return this.fax
    }

    getSelectedAddressItem() {
        return this.addressItem;
    }

    getSelectedAddress(): string {
        return this.addressLocId;
    }


    clearSelectedAddress() {
        this.cartGetSelectedAddress.next(null)
    }
}
