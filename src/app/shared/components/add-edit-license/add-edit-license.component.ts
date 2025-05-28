/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SessionService } from 'src/app/shared/services/session.service';
import { CommonService } from '../../services/common-service/common.service';
import { License } from './../../../features/registration/registration-form.model';
import { States } from 'src/app/core/models/common.model';
import { Subscription, Subject, take } from 'rxjs'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-license',
  templateUrl: './add-edit-license.component.html',
})

export class AddEditLicenseModalComponent implements OnInit {
  isEdit?: boolean;
  isAddLicenseTouched: boolean = false;
  isSubmitAddLicense: boolean = false;
  data: FormGroup;
  formData: License = {
    licenseState: '',
    licenseNumber: '',
  };
  formGroup: FormGroup;
  stateList: States[];
  licenseForm: FormArray;
  addLicenseSusbcription: Subscription;
  onSaved = new Subject();
  constructor(
    private bsModalRef: BsModalRef,
    private _fb: FormBuilder,
    private _common: CommonService,
    private _session: SessionService,
    private _toster: ToastrService
  ) { }

  ngOnInit() {
    this.formGroup = this._fb.group({
      licenseState: ['', Validators.required],
      licenseNumber: ['', [Validators.required]],
    });
    if (!this.stateList) {
      this.stateList = this._session?.get('stateList');
    }
    if (this.isEdit) {
      this.mapFormFieldValues();
    }
  }
  closeModal() {
    this.bsModalRef.hide();
  }

  addEditLicense() {
    this.isAddLicenseTouched = true;
    this.formData.licenseState = this.formGroup.get('licenseState').value;
    this.formData.licenseNumber = this.formGroup.get('licenseNumber').value;

    if (this.isSubmitAddLicense) {
      this.submitLicense();
    }
    this.closeModal();
  }

  submitLicense() {
    this.addLicenseSusbcription = this._common.addLicense(this.formData).pipe(take(1))
      .subscribe(res => {
        if (res?.success) {
          this._toster.success(res.message);
          this.onSaved.next(true);
        } else {
          this._toster.success(res.message);
          this.onSaved.next(false);
        }
      });
  }

  mapFormFieldValues() {
    this.formGroup.patchValue({
      licenseState: this.data.get('licenseState').value,
      licenseNumber: this.data.get('licenseNumber').value,
    });
  }
}
