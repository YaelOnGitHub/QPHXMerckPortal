import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AocModalComponent } from './aoc-modal/aoc-modal.component';
import { ProductTermsConditions } from 'src/app/core/models/order-submission.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { any } from 'cypress/types/bluebird';
import { Constants } from 'src/app/core/utilities/constants';
import { CloseAocRequest } from 'src/app/core/models/close-aoc.model';
import { AocDetailsRequestParams } from 'src/app/core/models/aoc-details.model';
import { CloseAocResponse } from 'src/app/core/models/manage-aoc.model';

@Injectable({
  providedIn: 'root'
})
export class AocService {
  alertModalRef: BsModalRef;

  public cartTermsAndConditionsValidStream: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
  public cartTermsAndConditionsValidStream$ = this.cartTermsAndConditionsValidStream.asObservable();

  constructor(public modalDailog: BsModalService, private _httpClient: HttpClient) { }


  private aocClasses = {    
    '7301' : { // In Progress
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
    '7302' : { // In Progress => Shipped (In Transit)
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
    '7307' : { // In Progress => PDMA Violation
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
    '7308' : { // In Progress => On Hold
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
    '7309' : { // In Progress => Waiting for Approval
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
    '7313' : { // In Progress => BR Violations
      'borderColor':'#FFF27D',
      'badgeColor': '#FFF27D',
      'headerColor' : '#000000'
    },
  
    '7312' : { // In Fulfillment => Extracted
      'borderColor':'#08A8EE',
      'badgeColor': '#08A8EE',
      'headerColor' : '#FFFFFF'
    }, 
    '7316' : { // In Fulfillment => Sent to Shipper
      'borderColor':'#08A8EE',
      'badgeColor': '#08A8EE',
      'headerColor' : '#FFFFFF'
    },
    '7318' : { // In Fulfillment => Backordered
      'borderColor':'#08A8EE',
      'badgeColor': '#08A8EE',
      'headerColor' : '#FFFFFF'
    },
  
    '7303' : { // Delivered
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    '7305' : { // Delivered => Complete
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    '7310' : { // Delivered => Partial AOC
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    '7311' : { // Delivered => Forgiven
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    '7314' : { // Delivered => Variance
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    '7315' : { // Delivered => Complete with Variance
      'borderColor':'#7ee78b',
      'badgeColor': '#7ee78b',
      'headerColor' : '#FFFFFF'
    },
    
  
  
    '7304' : { // Cancelled
      'borderColor':'#FE6F61',
      'badgeColor': '#FE6F61',
      'headerColor' : '#000000'
    },
    '7306' : { // Cancelled => Rejected
      'borderColor':'#FE6F61',
      'badgeColor': '#FE6F61',
      'headerColor' : '#000000'
    }, 
    '7317' : { // Cancelled => Cancelled
      'borderColor':'#FE6F61',
      'badgeColor': '#FE6F61',
      'headerColor' : '#000000'
    }, 
    '73019' : { // Cancelled => Lost In Transit
      'borderColor':'#FE6F61',
      'badgeColor': '#FE6F61',
      'headerColor' : '#000000'
    },
  }
  
  getAocClasses() {
    return this.aocClasses
  }


  public getAocStatus(): Observable<any> {
    return this._httpClient
        .get(`${environment.apiEndpoint}/Orders/getaocstatus`)
        .pipe(
            (response: any) => {
                return response;
            },
            (error: any) => {
                return error;
            }
        )
  }

  public getAocDetails(aocDetailsRequestParam: AocDetailsRequestParams, isMultiTenant = false): Observable<any> {

    return this._httpClient
        .post(`${environment.apiEndpoint}/Orders/FetchAocDetails`, {
          ...aocDetailsRequestParam
        })
        .pipe(
            catchError((error: any) => {
                return throwError(error);
            })
        );
}



  public closeAoc(request: CloseAocRequest): Observable<CloseAocResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    

    return this._httpClient.post(`${environment.apiEndpoint}/Orders/clearAOC`, request, { headers }).pipe(
      (response: any) => {
          return response;
      },
      (error: any) => {
          return error;
      }
  );
}

  public openAocModal(objArg): Observable<any> {
    const initialState = {
      backdrop: 'static',
      ...objArg,
      isModal: true
    }
    this.alertModalRef = this.modalDailog.show(AocModalComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
    return this.alertModalRef?.content?.onClose
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
}
