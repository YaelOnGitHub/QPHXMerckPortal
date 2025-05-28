import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-add-edit-address',
  templateUrl: './add-edit-address.component.html',
  styleUrls: ['./add-edit-address.component.scss'],
})
export class AddEditAddressModalComponent implements OnInit {
  data: any;

  isEdit: boolean;

  formGroup: FormGroup;

  name: string;

  designation: string;

  constructor(private _fb: FormBuilder, private bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      address1: '',
      address2: '',
      dea: '',
      sln: '',
    });

    if (this.isEdit) {
      this.mapAddressDetails();
    }
  }

  mapAddressDetails() {
    this.formGroup.patchValue({
      address1: this.data?.address1,
      address2: this.data?.address2,
      dea: this.data?.dea,
      sln: this.data?.sln,
    });
  }

  changeStatus(event) {}

  saveAddress() {}

  closeModal() {
    this.bsModalRef.hide();
  }
}
