/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ModalControlComponent } from './alert-modal-control/modal-control.component';

interface Alert {
  okBtnText?: string
  cancelBtnText?: string
  icon: any
  Heading: string
  extraText?: string
  SubHeading: string,
  isRequiredOkBtn?: boolean,
  isRequiredCancelBtn?: boolean,
  isModal?: boolean,
  customTitle?: string,
  isCustomTitle?: boolean,
  isMultiTenantOrderSubmission?: boolean,
  orderSubmissionData?:any;
  textAligment? : boolean
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private modalRefs: BsModalRef[] = [];
  constructor(public modalDailog: BsModalService) {
  }
  public error(objArg: Alert): Observable<any> {
    const initialState = {
      backdrop: 'static',
      ...objArg,
      isModal: false
    }
    const modalRef = this.modalDailog.show(ModalControlComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
    this.modalRefs.push(modalRef)     
    return modalRef?.content?.onClose
  }

  public confirm(objArg: Alert): Observable<any> {
    const initialState = {
      backdrop: 'static',
      ...objArg,
      isModal: true
    }
    const modalRef = this.modalDailog.show(ModalControlComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
    this.modalRefs.push(modalRef)
    return modalRef?.content?.onClose
  }

  public warning(objArg: Alert): Observable<any> {
    const initialState = {
      backdrop: 'static',
      ...objArg,
      isWarning: true
    }
    const modalRef = this.modalDailog.show(ModalControlComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
    this.modalRefs.push(modalRef)
    return modalRef?.content?.onClose
  }

  public closeAllModals() {
    this.modalRefs.forEach((modalRef) => modalRef.hide());
    this.modalRefs = [];
  }
}
