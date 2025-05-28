/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { States } from 'src/app/core/models/common.model';
import { AddEditAddressModalComponent } from '../../registration/add-edit-address/add-edit-address-modal.component';
import { SessionService } from 'src/app/shared/services/session.service';
import { ManageSecurityService } from '../../manage-security/service/manage-security.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { DeleteLicenseOrAddressModalComponent } from '../../registration/delete-license-address/delete-license-address-modal.component';
import { License } from 'src/app/core/models/license.model';
import { AlertService } from '../../../shared/components/alert/alert.service';


@Component({
    selector: 'app-manage-address',
    templateUrl: './manage-address.component.html',
    styleUrls: ['./manage-address.component.scss']
})

export class ManageAddressComponent implements OnInit {

    formGroup: FormGroup;
    _editAddressModalRef: BsModalRef;
    _deleteLicenseorAddressModalRef: BsModalRef;
    stateList: States[] = [];

    addAddressModalSub: Subscription;
    editAddressModalSub: Subscription;
    manageLicenseSubscription: Subscription;

    displayAddNewLicense: boolean;
    displayAddNewAddress: boolean;
    displayEditAddress: boolean;
    displayEditLicense: boolean;
    displayDeleteLicense: boolean;
    displayDeleteAddress: boolean;
    licenseData: License;
    licensesArray: License[];

    constructor(public _addAddressModalRef: BsModalRef,
        private _modalService: BsModalService,
        private _fb: FormBuilder,
        private _session: SessionService,
        private _manageSecurity: ManageSecurityService,
        private _toster: ToastrService,
        private _commonService: CommonService,
        private _entitlement: EntitlementService,        
        private _alertService: AlertService) { }

    //need name and specialization from service

    ngOnInit(): void {
        this.manageLicenseSubscription = this._commonService.getLicenses().subscribe(res => {
            if (res?.data['licences']) {
                this.licensesArray = res.data['licences'];
                this._commonService.setLicenseArray(this.licensesArray)
            }
        }
        );
        this.displayAddNewAddress =
            this._entitlement.hasEntitlementMatch('ALLOW_ADD_ADDRESS');
        this.displayEditAddress =
            this._entitlement.hasEntitlementMatch('ALLOW_EDIT_ADDRESS');
        this.displayDeleteAddress =
            this._entitlement.hasEntitlementMatch('ALLOW_DELETE_ADDRESS');

        this.getStates();

        this.formGroup = this._fb.group({
            address: this._fb.array([])
        });
        this.initialMap();
    }
    getStates() {
        if (this._session.get('stateList')) {
            this.stateList = this._session.get('stateList');
        } else {
            this._commonService.getStateList().subscribe((statesResponse) => {
                if (statesResponse.success) {
                    this._session.setItem("stateList", statesResponse.data.states);
                    this.stateList = statesResponse.data.states;
                }
            });
        }
    }

    initialMap() {

        this._manageSecurity.getAddress().subscribe((addressRes) => {
            this.mapAddress(addressRes?.data?.addresses);
            if (addressRes.success) {
                // this._toster.success(addressRes?.message);
            } else {
                this._toster.error(addressRes?.message);
            }
        })
    }

    get address(): FormArray {
        return this.formGroup.get("address") as FormArray;
    }

    getAddressControlByName(groupIndex: number, controlName: string): FormControl {
        const fg = this.address.at(groupIndex) as FormGroup;
        return fg.get(controlName) as FormControl;
    }

    addEditAddress(isEdit, control?) {
        let initialState = {
            data: control,
            isEdit: isEdit,
            isEditAddressSubmit: true,
            isAddAddressSubmit: false,
            isFormData: false
        };
        this._editAddressModalRef =
            this._modalService.show(AddEditAddressModalComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered' });

        this.editAddressModalSub = this._editAddressModalRef?.content?.onEditAddressSaved?.subscribe((afterEditAddress) => {
            if (afterEditAddress) {
                this.initialMap();
            }
        });
    }

    deleteStateLicenseOrAddress(entityType, data, index) {
        if (data.deaNum !== null && data.deaNum !== undefined) 
        {
            this._alertService
            .warning({              
                isCustomTitle: true,
                customTitle: 'Address Deletion Restricted',
                Heading: '',
                SubHeading: '',
                okBtnText: 'OK',
                isRequiredOkBtn: true,
                textAligment: true,
                extraText: 'This addresses is associated with a DEA license and hence cannot be deleted.',
                icon: ''
            });            
            return;
        }
        let initialState = {
            label: 'Are you sure you want to delete this address?',
            data: data,
            entityType: 'Delete Address Confirmation',
            formData: false
        };
        this._deleteLicenseorAddressModalRef = this._modalService.show(
            DeleteLicenseOrAddressModalComponent,
            {
                initialState,
                ignoreBackdropClick: true,
                class: 'modal-md modal-dialog-centered',
            }
        );

        this._modalService.onHide.pipe(take(1)).subscribe(res => {
            if (this._deleteLicenseorAddressModalRef?.content?.deleteContent) {
                if (data?.locationId) {
                    this._manageSecurity.deleteAddress(data?.locationId).subscribe((deleteRes) => {
                        if (deleteRes.success) {
                            this._toster.success(deleteRes.message);
                            this.initialMap();
                        }
                    })
                }
            }
        });
    }

    changeStatus(control, index, event) {
        control.isPreferredAddress = event;
    }

    addAddress(isEdit?) {
        let initialState = {
            isEdit: isEdit,
            data: {},
            isAddAddressSubmit: true,
            isEditAddressSubmit: false
        }
        this._addAddressModalRef =
            this._modalService.show(AddEditAddressModalComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered' });
        this.addAddressModalSub = this._addAddressModalRef.content.onAddAddressSaved.subscribe((afterAddAddress) => {
            if (afterAddAddress) {
                this.initialMap();
            }
        });
    }

    mapAddress(data) {
        this.address.clear();
        if (Array.isArray(data)) {
            data?.map((address) => {
                const addressForm = this._fb.group({
                    HCPFullName: address?.firstName + ' ' + address?.lastName,
                    firstName: address?.firstName,
                    lastName: address?.lastName,
                    designation: address.designation,
                    fax: address.fax,
                    address1: address.address1,
                    address2: address.address2,
                    city: address.city,
                    state: address.state,
                    phone: address.phoneNum,
                    deaNum: address.deaNum,
                    zipCode: address.zipCode,
                    licenseNumber: address.licenseNumber,
                    isPreferredAddress: address.isPreferredAddress,
                    locationId: address?.addressLocId,
                    sln: this.resolveSLN(address.state),
                    addressStatus: address?.addressStatus,
                    addressStatusMessage: address?.addressStatusMessage,
                });
                this.address.push(addressForm);
            });
            this.formGroup.updateValueAndValidity();
        }
        else {
            const addressForm = this._fb.group({
                HCPFullName: data?.firstName + ' ' + data?.lastName,
                designation: data.designation,
                fax: data.fax,
                address1: data.address1,
                address2: data.address2,
                city: data.city,
                state: data.state,
                phone: data.phoneNum,
                deaNum: data.deaNum,
                zipCode: data.zipCode,
                licenseNumber: data?.licenseNumber,
                isPreferredAddress: data.isPreferredAddress,
                locationId: data?.addressLocId,
                sln: this.resolveSLN(data.state),
                addressStatus: data?.addressStatus,
                addressStatusMessage: data?.addressStatusMessage,
            });
            this.address.push(addressForm);
            this.formGroup.updateValueAndValidity();
        }
    }

    resolveSLN(state) {
        this.licenseData = this.licensesArray?.find(el => {
            return el?.licenseState === state
        })
        return this.licenseData?.licenseNumber;
    }



    onDeleteAddress(deleteAddressId) {
        this._manageSecurity.deleteAddress(deleteAddressId).subscribe((deleteRes) => {

        })

    }

    ngOnDestroy() {
        if (this.addAddressModalSub) {
            this.addAddressModalSub.unsubscribe();
        }
        if (this.editAddressModalSub) {
            this.editAddressModalSub.unsubscribe();
        }
        this.manageLicenseSubscription?.unsubscribe();
    }
}