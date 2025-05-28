import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-srf-link-modal',
  templateUrl: './srf-link-modal.component.html',
  styleUrls: ['./srf-link-modal.component.scss']
})
export class SrfLinkModalComponent implements OnInit {

  public onClose: Subject<boolean>;
  constructor(public bsModalRef: BsModalRef) { }



  okBtnText: string = 'Ok';
  cancelBtnText: string = 'Cancel';
  icon: any = 'fa-check';
  Heading: string = 'Model Heading..';
  SubHeading: string;
  extraText?: any;
  isCustomTitle = false;
  cancelBtnRequired = true;

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
