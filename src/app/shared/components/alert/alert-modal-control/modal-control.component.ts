/* eslint-disable prettier/prettier */
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-control',
  templateUrl: './modal-control.component.html',
  styleUrls: ['./modal-control.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalControlComponent implements OnInit {

  public onClose: Subject<boolean>;
  constructor(public bsModalRef: BsModalRef) { }

  okBtnText: string = 'Ok';
  cancelBtnText: string = 'Cancel';
  icon: any = 'fa-check';
  Heading: string = 'Model Heading..';
  SubHeading: string;
  extraText?: any;
  isWarning?:boolean = false;
  isModal: boolean = false;
  isRequiredOkBtn: boolean = true;
  isRequiredCancelBtn: boolean = false;
  btnSubscription: Subscription;
  isCustomTitle = false;
  orderSubmissionData? :any
  isMultiTenantOrderSubmission? : boolean = false;
  textAligment? :boolean = false;
  
  ngOnInit(): void {
    this.onClose = new Subject();
  }

  onCancel() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  onConfirm() {
    this.onClose.next(true);
    this.bsModalRef.hide();
  }
}
