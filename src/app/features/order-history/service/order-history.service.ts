import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  constructor(private _httpClient : HttpClient) { }


  private orderClasses = {    
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

  getOrderClasses() {
    return this.orderClasses
  }

  public getOrderDetails(data,action, isMultiTenant= false): Observable <any> {
    const apiPath = isMultiTenant ? `OrderId=${data.orderId}&childClientId=${data.childClientId}&childProjectId=${data.childProjectId}&childHcpId=${data.childHcpId}` : `OrderId=${data.orderId}`   
    return this._httpClient.get(`${environment.apiEndpoint}/Orders/${action}?${apiPath}`)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }


  public getOrderHistory(orderHistoryRequestParam, isMultiTenant = false): Observable <any> {
    const path = isMultiTenant ? 'FetchOrderHistorySplit' : 'FetchOrderHistory'
    return this._httpClient.post(`${environment.apiEndpoint}/Orders/${path}`, {
      ...orderHistoryRequestParam
    })
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }
}
