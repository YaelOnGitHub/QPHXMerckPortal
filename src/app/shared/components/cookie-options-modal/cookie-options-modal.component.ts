import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cookie-options-modal',
  templateUrl: './cookie-options-modal.component.html',
  styleUrls: ['./cookie-options-modal.component.scss']
})
export class CookieOptionsModalComponent implements OnInit {


  public onClose: Subject<boolean>;
  constructor(public bsModalRef: BsModalRef) { 
  }

  okBtnText: string = 'Ok';
  cancelBtnText: string = 'Cancel';
  icon: any = 'fa-check';
  Heading: string = 'Model Heading..';
  SubHeading: string;
  extraText?: any;
  isCustomTitle = false;


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
