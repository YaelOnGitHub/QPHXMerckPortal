/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { StatesResponse } from 'src/app/core/models/common.model';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { Constants } from 'src/app/core/utilities/constants';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ManageSecurityService } from '../../manage-security/service/manage-security.service';


@Component({
    selector: 'app-manage-address-add-edit',
    templateUrl: './add-edit-address-modal.component.html',
    styleUrls: ['./add-edit-address-modal.component.scss']
})

export class AddEditAddressModalComponent implements OnInit {

    isEdit?: boolean;
    formGroup: FormGroup;
    data: any;
    formData = {
        city: '',
        fax: '',
        phone: '',
        state: '',
        address1: '',
        address2: '',
        dEA: '',
        isPreferredAddress: false, 
        zip: '',
        locationId: '',
    };
    stateList: StatesResponse;
    isAddAddressTouched: boolean = false;
    isValidLicense:boolean = false
    isDeaRequired: boolean = false;;
    isAddAddressSubmit: boolean = false;
    isEditAddressSubmit: boolean = false;
    onAddAddressSaved: Subject<boolean>;
    onEditAddressSaved?: Subject<boolean>;
    addAddressSubmit: Subscription;
    editAddressSubmit: Subscription;
    isFormData: boolean;
    isShowPrefferAddress: boolean = true
    constructor(private bsModalRef: BsModalRef,
        private _fb: FormBuilder,
        private _session: SessionService,
        private _entitlement: EntitlementService,
        private _manageSecurityService: ManageSecurityService,
        private _commonService: CommonService,
        private _toster: ToastrService,
        private _loader: LoaderService) { }

    ngOnInit() {
        this.onAddAddressSaved = new Subject();
        this.onEditAddressSaved = new Subject();
        this.isAddAddressTouched = false;

        this.formGroup = this._fb.group({
            address1: ['', Validators.required],
            address2: [''],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            zipCode: ['', [Validators.required, Validators.pattern(Constants.onlyNumber), Validators.minLength(5)]],
            deaNumber: [''],
            isPreferredAddress: [false],
            phone: ['', [Validators.required, Validators.pattern(Constants.onlyNumber)]],
            fax: ['', [Validators.pattern(Constants.onlyNumber)]],
            locationId: [''],
        });
        this.stateList = this._session.get("stateList");
        
        if (this.isEdit) {
            this.mapFormFieldValues();
        }

        this.isDeaRequired = this._entitlement.hasEntitlementMatch("ALLOW_DEA");
    }
    closeModal() {
        this.bsModalRef.hide();
    }

    validateLicense() {
        const state = this.formGroup.get('state').value
        const registeredLicense = this._commonService.getLicenseArray()
        const isValid = registeredLicense.some(license => {
            return license.licenseState == state && license.licenseStatus?.toLowerCase() == 'valid'
        })
        this.isValidLicense = isValid ? false : true

    }

    mapFormFieldValues() {
        if (this.isFormData) {
            this.formGroup.patchValue({
                address1: this.data?.get('address1').value,
                address2: this.data?.get('address2').value,
                city: this.data?.get('city').value,
                state: this.data?.get('state').value,
                zipCode: this.data?.get('zipCode').value,
                phone: this.data?.get('phoneNum').value,
                fax: this.data?.get('fax').value,
                deaNumber: this.data?.get('deaNum').value,
                isPreferredAddress: this.data?.get('isPreferredAddress')?.value === 'Y' ? true : false,
            })
        } else {
            this.formGroup.patchValue({
                address1: this.data?.address1,
                address2: this.data?.address2,
                city: this.data?.city,
                state: this.data?.state,
                zipCode: this.data?.zipCode,
                phone: this.data?.phone,
                fax: this.data?.fax,
                deaNumber: this.data?.deaNum,
                isPreferredAddress: this.data?.isPreferredAddress === 'Y'? true: false,
                locationId: this.data?.locationId,
            })
        }

    }

    checkAddress(formdata) {
       const val = formdata.isPreferredAddress;
       if(typeof val == 'boolean') {
        return val;
       }
        return val === 'Y'? true: false
    }

    addEditAddress() {

        this.isAddAddressTouched = true;
        this.formData.city = this.formGroup.get('city').value;
        this.formData.address1 = this.formGroup.get('address1').value;
        this.formData.address2 = this.formGroup.get('address2').value;
        this.formData.fax = this.formGroup.get('fax').value;
        this.formData.phone = this.formGroup.get('phone').value;
        this.formData.dEA = this.formGroup.get('deaNumber').value;
        this.formData.isPreferredAddress = this.formGroup.get('isPreferredAddress').value
        this.formData.zip = this.formGroup.get('zipCode').value;
        this.formData.state = this.formGroup.get('state').value;
        this.formData.locationId = this.formGroup.get('locationId').value

        if (this.isAddAddressSubmit) {
            let addAddressParam = {
                "address1": this.formData.address1,
                "address2": this.formData.address2,
                "city": this.formData.city,
                "state": this.formData.state,
                "zip": this.formData.zip,
                "fax": this.formData.fax ? this.formData.fax.replace(/-/g, "") : '',
                "dEA": this.formData.dEA,
                "phone": this.formData.phone ? this.formData.phone?.replace(/-/g, "") : '',
                "isPreferredAddress": this.checkAddress(this.formData),
                "addressCheckSum": null,
                "locationId": null,
            }
            this._manageSecurityService.addAddress(addAddressParam).subscribe((addAddressRes) => {
                if (addAddressRes.success) {
                    this.onAddAddressSaved.next(true);
                    this._toster.success(addAddressRes.message);
                    this.closeModal();
                } else {
                    this.onAddAddressSaved.next(false);
                    this._toster.error(addAddressRes.message);
                    this.closeModal();
                }
            })
        } else if (this.isEditAddressSubmit) {
            let addAddressParam = {
                "address1": this.formData.address1,
                "address2": this.formData.address2,
                "city": this.formData.city,
                "state": this.formData.state,
                "zip": this.formData.zip,
                "fax": this.formData.fax ? this.formData.fax.replace(/-/g, "") : '',
                "dEA": this.formData.dEA,
                "phone": this.formData.phone ? this.formData.phone?.replace(/-/g, "") : '',
                "isPreferredAddress": this.checkAddress(this.formData),
                "locationId": this.formData?.locationId,
                "addressCheckSum": null,
            }
            this._manageSecurityService.editAddress(addAddressParam).subscribe((EditAddressRes) => {
                if (EditAddressRes.success) {
                    this.onEditAddressSaved.next(true);
                    this._toster.success(EditAddressRes.message);
                    this.closeModal();
                } else {
                    this.onEditAddressSaved.next(false);
                    this._toster.error(EditAddressRes.message);
                    this.closeModal();
                }
            });
        } else {
            this.closeModal();
        }

    }

    ngOnDestroy() {
        this.onEditAddressSaved.next(false);
        this.onAddAddressSaved.next(false);
        if (this.addAddressSubmit) {
            this.addAddressSubmit.unsubscribe();
        }
        if (this.editAddressSubmit) {
            this.editAddressSubmit.unsubscribe();
        }
    }
}