/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { StatesResponse } from 'src/app/core/models/common.model';
import { Constants } from 'src/app/core/utilities/constants';
import { LicenseAddress } from 'src/app/shared/models/license-address.model';
import { SessionService } from 'src/app/shared/services/session.service';


@Component({
    selector: 'app-add-address',
    templateUrl: './add-address.component.html',
    styleUrls: ['./add-address.component.scss']
})

export class AddAddressComponent implements OnInit {

    isEdit?: boolean;
    formGroup: FormGroup;
    data: FormGroup;
    formData: any = {
        city: '',
        state: '',
        address1: '',
        address2: '',
        deaNumber: '',
        sln: '',
        zip: ''
    };
    stateList: StatesResponse;
    isAddAddressTouched: boolean = false;

    constructor(private bsModalRef: BsModalRef, private _fb: FormBuilder, private _session: SessionService) { }

    ngOnInit() {
        this.formGroup = this._fb.group({
            address1: ['', Validators.required],
            address2: [''],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            sln: [''],
            dea: ['']
        });
        // this.stateList = this._session.get("stateList");
        if (this.isEdit) {
            this.mapFormFieldValues();
        }
    }
    closeModal() {
        this.bsModalRef.hide();
    }

    mapFormFieldValues() {
        this.formGroup.patchValue({
            address: this.data?.get('address1').value,
            city: this.data?.get('city').value,
            state: this.data?.get('state').value,
            zip: this.data?.get('sln').value,
            dea: this.data?.get('dea').value
        })
    }

    addAddress() {
        this.isAddAddressTouched = true;
        this.formData.city = this.formGroup.get('city').value;
        this.formData.address1 = this.formGroup.get('address1').value;
        this.formData.address2 = this.formGroup.get('address2').value;
        this.formData.dea = this.formGroup.get('dea').value;
        this.formData.sln = this.formGroup.get('sln').value;
        this.formData.state = this.formGroup.get('state').value;
        this.closeModal();
    }
}