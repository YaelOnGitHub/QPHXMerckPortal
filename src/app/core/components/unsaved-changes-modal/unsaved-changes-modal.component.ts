import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-unsaved-changes-modal',
  templateUrl: './unsaved-changes-modal.component.html',
  styleUrls: ['./unsaved-changes-modal.component.scss']
})
export class UnsavedChangesModalComponent implements OnInit {


  label: string;
  btnSuccessTxt: string;
  btnCancelTxt: string;
  entityType: string;
  isConfirm: boolean = false;
  constructor(private bsModalRef: BsModalRef, private _fb: FormBuilder) { }

  ngOnInit() {

  }
  closeModal() {
    this.bsModalRef.hide();
  }

  onConfirm() {
    this.isConfirm = true;
    this.closeModal();
  }
}
