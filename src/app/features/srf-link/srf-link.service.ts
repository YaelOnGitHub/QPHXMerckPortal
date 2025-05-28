import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SrfLinkModalComponent } from './srf-link-modal/srf-link-modal.component';

@Injectable({
  providedIn: 'root'
})
export class SrfLinkService {
  alertModalRef: BsModalRef;
  constructor(private _httpClient: HttpClient,public modalDailog: BsModalService) { }


  public checkPendingSRF(): Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/SRF/CheckSRFPending`, {})
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public verifySRFLink(params): Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/SRF/VerifySRFLink`,params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public fetchSRFProducts(params): Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/SRF/FetchSRFProducts`,params)
      .pipe(
        (response: any) => {
          return response;
        }, (error: any) => {
          return error;
        });
  }

  public cancelSRF(params) : Observable<any> {
    return this._httpClient.post(`${environment.apiEndpoint}/SRF/cancelsrf`,params)
    .pipe(
      (response: any) => {
        return response;
      }, (error: any) => {
        return error;
      });
  }

  public openSRFModal(objArg): Observable<any> {
    const initialState = {
      backdrop: 'static',
      ...objArg,
      isModal: true
    }
    this.alertModalRef = this.modalDailog.show(SrfLinkModalComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
    return this.alertModalRef?.content?.onClose
  }

}
