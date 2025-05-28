/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription,Observable } from 'rxjs'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AddEditLicenseModalComponent } from 'src/app/shared/components/add-edit-license/add-edit-license.component';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { License } from '../../registration/registration-form.model';
import { StatesResponse } from 'src/app/core/models/common.model';
import { EntitlementService } from 'src/app/core/services/entitlement.service';

@Component({
  selector: 'app-manage-license',
  templateUrl: './manage-license.component.html',
  styleUrls: ['./manage-license.component.scss'],
})
export class ManageLicenseComponent implements OnInit {

  licenses$: Observable<License[]>
  formGroup: FormGroup;
  licenseArray: License[];
  manageLicenseSubscription: Subscription;
  getStatesSusbcription: Subscription;
  stateList: StatesResponse;

  displayAddNewLicense: boolean;
  displayDeleteLicense: boolean;

  constructor(
    public _addLicenseModalRef: BsModalRef,
    private _modalService: BsModalService,
    private _fb: FormBuilder,
    private _common: CommonService,
    private _entitlement: EntitlementService
  ) { }

  ngOnInit(): void {
    this.displayAddNewLicense =
      this._entitlement.hasEntitlementMatch('ALLOW_ADD_LICENSE');
    this.displayDeleteLicense =
      this._entitlement.hasEntitlementMatch('ALLOW_DELETE_LICENSE');

    this.formGroup = this._fb.group({
      license: this._fb.array([]),
    });
    this.manageSubscriptions();
  }

  manageSubscriptions() {
    this.manageLicenseSubscription = this._common.getLicenses().subscribe(res => {
      if (res) {
        this.licenseArray = res['data'].licences;
        this._common.setLicenseArray(this.licenseArray);
        this.mapLicense(res['data'].licences);
      }
    }
    );
    this.getStatesSusbcription = this._common.getStateList().subscribe(
      res => {
        if (res) {
          this.stateList = res;
        }
      }
    );
  }

  get license(): FormArray {
    return this.formGroup.get('license') as FormArray;
  }

  mapLicense(data) {
    if (Array.isArray(data)) {
      data?.map(license => {
        const licenseForm = this._fb.group({
          licenseNumber: license.licenseNumber,
          licenseState: license.licenseState,
          licenseStatus: license.licenseStatus,
        });
        this.license.push(licenseForm);
      });
    }
  }

  addLicense() {
    let initialState = {
      isEdit: false,
      stateList: this.resolveStates(),
      isSubmitAddLicense: true,
    };

    this._addLicenseModalRef = this._modalService.show(
      AddEditLicenseModalComponent,
      {
        initialState,
        ignoreBackdropClick: true,
        class: 'modal-md modal-dialog-centered',
      }
    );
    this._addLicenseModalRef.content.onSaved.subscribe((item) => {
      if (item) {
        this.manageSubscriptions();
      }
    })
  }

  checkStatus(status, state) {
    if (state == 'invalid' && status == null) {
      return true
    }

    if (status?.toLowerCase() === state) {
      return true
    }
    return false
  }

  resolveStates() {
    let res = this.stateList.data.states.filter(el => {
      return !this.licenseArray.find((element:any) => {
        return element.licenseState === el.stateCode && element.licenseStatus == 'VALID'
      })
    });
    return res;
  }

  removeLicense(control, index) {
    this.license.removeAt(index);
  }

  ngOnDestroy(): void {
    this.manageLicenseSubscription?.unsubscribe();
    this.getStatesSusbcription?.unsubscribe();
  }
}

