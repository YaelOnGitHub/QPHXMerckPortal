/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-delete-license-address',
    templateUrl: './delete-license-address-modal.component.html',
    styleUrls: ['./delete-license-address-modal.component.scss']
})

export class DeleteLicenseOrAddressModalComponent implements OnInit {

    data: FormGroup;
    formData: boolean = true;
    label: string;
    entityType: string;
    formGroup: FormGroup;
    deleteContent: boolean = false;
    constructor(private bsModalRef: BsModalRef, private _fb: FormBuilder) { }

    ngOnInit() {
        this.formGroup = new FormGroup({
            address1: new FormControl(''),
            address2: new FormControl(''),
            city: new FormControl(''),
            state: new FormControl(''),
            zipCode: new FormControl('')
        })

        if (this.entityType === 'address') {
            this.mapFieldValues();
        }
    }
    closeModal() {
        this.bsModalRef.hide();
    }

    mapFieldValues() {
        if (this.formData) {
            this.formGroup.get('address1').setValue(this.data.get('address1').value);
            this.formGroup.get('address2').setValue(this.data.get('address2').value);
            this.formGroup.get('city').setValue(this.data.get('city').value);
            this.formGroup.get('state').setValue(this.data.get('state').value);
            this.formGroup.get('zipCode').setValue(this.data.get('zipCode').value);
        } else {
            this.formGroup.get('address1').setValue(this.data['address1']);
            this.formGroup.get('address2').setValue(this.data['address2']);
            this.formGroup.get('city').setValue(this.data['city']);
            this.formGroup.get('state').setValue(this.data['state']);
            this.formGroup.get('zipCode').setValue(this.data['zipCode']);
        }
    }

    delete() {
        this.deleteContent = true;
        this.closeModal();
    }
}