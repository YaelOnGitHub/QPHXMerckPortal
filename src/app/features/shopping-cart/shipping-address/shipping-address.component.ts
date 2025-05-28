import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take, Subscription } from 'rxjs';
import { States } from 'src/app/core/models/common.model';
import { AddEditAddressModalComponent } from 'src/app/features/registration/add-edit-address/add-edit-address-modal.component';
import { SessionService } from 'src/app/shared/services/session.service';
import { ManageSecurityService } from '../../manage-security/service/manage-security.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteLicenseOrAddressModalComponent } from 'src/app/features/registration/delete-license-address/delete-license-address-modal.component';
import { CartService } from '../service/cart.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { License } from '../../registration/registration-form.model';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { Constants } from 'src/app/core/utilities/constants';
import { EntitlementService } from 'src/app/core/services/entitlement.service';

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingAddressComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  stateList: States[] = [];
  editAddressModalSub: Subscription;
  addAddressModalSub: Subscription;
  getSelectedProductSub: Subscription;
  _deleteLicenseorAddressModalRef: BsModalRef;
  licenseData: License;
  licensesArray: License[];
  manageLicenseSubscription: Subscription;
  isAnyPrefferedAddress: boolean = false;
  isAnySRFPrefferedAddress: boolean = false;
  requestedProductList: any = [];

  @Input() isEditUpdateControls? : boolean = false
  IS_RX_ITEM: boolean = false;
  IS_CONTROLLED_SUBSTANCE_ITEM: boolean = false;

  displayAddNewLicense: boolean;
  displayAddNewAddress: boolean;
  displayEditAddress: boolean;
  displayEditLicense: boolean;
  displayDeleteLicense: boolean;
  displayDeleteAddress: boolean;
  isDeaRequired: boolean;
  CONTROLLED_PRODUCT_TYPES: any;
  isValidAddress: any = [];

  constructor(
    public _addAddressModalRef: BsModalRef,
    public _editAddressModalRef: BsModalRef,
    private _modalService: BsModalService,
    private _fb: FormBuilder,
    private _session: SessionService,
    private _toster: ToastrService,
    private _manageSecurity: ManageSecurityService,
    private _CartService: CartService,
    private _commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private _cartManagementService: cartManagementService,
    private _entitlement: EntitlementService
  ) { }

  ngOnInit() {


    this.displayAddNewAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_ADD_ADDRESS');
    this.displayEditAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_EDIT_ADDRESS');
    this.displayDeleteAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_DELETE_ADDRESS');

    this.isDeaRequired = this._entitlement.hasEntitlementMatch("ALLOW_DEA");

    this.CONTROLLED_PRODUCT_TYPES = JSON.parse(this._entitlement.keyValueJSON('CONTROLLED_PRODUCT_TYPES')).DrugTypes.filter((prd) => {
      if(prd.Type == 'ControlledSubstance') {
          return prd
      }
    })

    this.formGroup = this._fb.group({
      address: this._fb.array([])
    });
    this.getStates();
    this.manageLicenseSubscription = this._commonService
      .getLicenses()
      .subscribe(res => {
        if (res?.data['licences']) {
          this.licensesArray = res.data['licences'];
          this._commonService.setLicenseArray(this.licensesArray)
        }
      });
    this.stateList = this._session.get('stateList');
    this.initialMap();
    this.getSelectedProductSub = this._cartManagementService
      .getSelectedProductItems()
      .subscribe(selectedProductItem => {
        if(selectedProductItem.length !== 0)
          this.requestedProductList = selectedProductItem
          this.onProductValidation(selectedProductItem);
      });
  }

  onProductValidation(selectedProductItem) {
    this.IS_CONTROLLED_SUBSTANCE_ITEM = false;
    this.IS_RX_ITEM = false;
    selectedProductItem?.forEach(productItem => {
      if (parseInt(productItem.productTypeCode) === Constants.producTypeCode.ControlledSubstance) {
        this.IS_CONTROLLED_SUBSTANCE_ITEM = true;
      } else if (parseInt(productItem.productTypeCode) === Constants.producTypeCode.Rx) {
        this.IS_RX_ITEM = true;
      }
    });
    this.mapAddress(this.address.value);
  }


  initialMap() {
   const srfAddressId = this._session.get('SRFAddressId') || '';
    this._CartService.setSelectedAddress(null);
    this._manageSecurity.getAddress().subscribe(addressRes => {
      if (addressRes.success) {
        let updatedAddress = addressRes?.data?.addresses.map((addressItem, index) => {

          if ((addressItem.isPreferredAddress && addressItem.isPreferredAddress?.toLowerCase() === 'y' && addressItem?.addressStatus?.toLowerCase() === 'valid')) {
            this._CartService.setSelectedAddress(addressItem?.addressLocId);
            this._CartService.setSelectedAddressItem(addressItem)
            this.isAnyPrefferedAddress = true;
            return {
              ...addressItem,
              isChecked: true
            }
          } else if (srfAddressId && srfAddressId == addressItem?.addressLocId) {
            this._CartService.setSelectedAddress(addressItem?.addressLocId);
            this._CartService.setSelectedAddressItem(addressItem)
            this.isAnySRFPrefferedAddress = true;
            return {
              ...addressItem,
              isChecked: true
            }
          }
           else  {
            return {
              ...addressItem,
              isChecked: false
            }
          }
        });
       
        updatedAddress = this.setSRFAddressPreference(updatedAddress)
        this.mapAddress(updatedAddress);
      } else {
        this._toster.error(addressRes?.message);
      }
    });
  }

  setSRFAddressPreference(updatedAddress) {
    if(this.isAnyPrefferedAddress && this.isAnySRFPrefferedAddress) {
      updatedAddress.forEach((address) => {
        if(address.isPreferredAddress?.toLowerCase() === 'y') {
          address.isChecked = false
        }
      });
    }
    return updatedAddress;
  }
  getStates() {
    if (this._session.get('stateList')) {
      this.stateList = this._session.get('stateList');
    } else {
      this._commonService.getStateList().subscribe(statesResponse => {
        if (statesResponse.success) {
          this._session.setItem('stateList', statesResponse.data.states);
          this.stateList = statesResponse.data.states;
        }
      });
    }
  }

  get address(): FormArray {
    return this.formGroup.get('address') as FormArray;
  }

  addEditAddress(isEdit, control?) {
    let initialState = {
      data: control,
      isEdit: isEdit,
      isEditAddressSubmit: true,
      isAddAddressSubmit: false,
      isFormData: false,
    };
    this._editAddressModalRef = this._modalService.show(
      AddEditAddressModalComponent,
      {
        initialState,
        ignoreBackdropClick: true,
        class: 'modal-md modal-dialog-centered',
      }
    );

    this.editAddressModalSub =
      this._editAddressModalRef?.content?.onEditAddressSaved?.subscribe(
        afterEditAddress => {
          if (afterEditAddress) {
            this.initialMap();
          }
        }
      );
  }

  onAddressSelection(e, addressId,item) {
    let updatedAddress = this.address.value?.map((item) => {
      if (e?.target?.checked && addressId === item?.locationId) {
        return {
          ...item,
          addressLocId: item?.locationId,
          isChecked: true
        }
      } else if (!e?.target?.checked && addressId === item?.locationId) {
        return {
          ...item,
          addressLocId: item?.locationId,
          isChecked: true
        }
      }
      else {
        return {
          ...item,
          addressLocId: item?.locationId,
          isChecked: false
        }
      }
    });
    this.mapAddress(updatedAddress);
    this._CartService.setSelectedAddress(addressId);
    this._CartService.setSelectedAddressItem(item)
  }

  removeAddress(control, index) {
    this.address?.removeAt(index);
  }

  addAddress(isEdit?) {
    let initialState = {
      isEdit: isEdit,
      data: {},
      isAddAddressSubmit: true,
      isEditAddressSubmit: false,
    };

    this._addAddressModalRef = this._modalService.show(
      AddEditAddressModalComponent,
      {
        initialState,
        ignoreBackdropClick: true,
        class: 'modal-md modal-dialog-centered',
      }
    );
    this.addAddressModalSub =
      this._addAddressModalRef.content?.onAddAddressSaved.subscribe(
        afterAddAddress => {
          if (afterAddAddress) {
            this.initialMap();
          }
        }
      );
  }

  deleteStateLicenseOrAddress(entityType, data, index) {
    let initialState = {
      label: 'Are you sure you want to delete this Address?',
      data: data,
      entityType: 'address',
      formData: false,
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
          let deleteAddressParam = {
            locationId: data.locationId,
          };
          this._manageSecurity
            .deleteAddress(data.locationId)
            .subscribe(deleteRes => {
              if (deleteRes.success) {
                this.initialMap();
              }
            });
        }
      }
    });
  }

  isNotValidAddress(address) {
    const drugProducts = this.controllSubstanceProducts(this.requestedProductList)
    if(drugProducts.length !== 0) {
      this.isValidAddress.push(false)
      if(address.deaNum !== null 
          && address.addressStatus?.toLowerCase() == 'valid'
          && address.controlledSubstanceEligStatus?.toLowerCase() == 'valid'
            ) {
        return false;
      }
      return true;
    }
    return false;
  }

  controllSubstanceProducts(productList) {
    const existingProductIndex = [];
    const notAllowedProductCode = this.CONTROLLED_PRODUCT_TYPES.map(prd => parseInt(prd.Code))
    productList.map((product, index) => {
      if (notAllowedProductCode.includes(product.productTypeCode)) {
        existingProductIndex.push(index + 1)
      }
    });
    return existingProductIndex;
  }

  
  mapAddress(data) {
    this.address.clear();
    this.isValidAddress = [];
    if (Array.isArray(data)) {
      data?.map(address => {
        const addressForm = this._fb.group({
          HCPFullName: address?.firstName + ' ' + address?.lastName,
          firstName: address?.firstName,
          lastName: address?.lastName,
          designation: address.designation,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          state: address.state,
          licenseNumber: address.licenseNumber,
          deaNum: address.deaNum,
          zipCode: address.zipCode,
          fax: address.fax,
          phone: address.phoneNum || address.phone,
          isPreferredAddress: address.isPreferredAddress,
          locationId: address?.addressLocId || address?.locationId,
          sln: this.resolveSLN(address.state),
          addressChecksum: address?.addressCheckSum,
          controlledSubstanceEligStatus: address?.controlledSubstanceEligStatus,
          isChecked: address?.isChecked ? true : false,
          addressStatus: address?.addressStatus,
          addressStatusMessage: address?.addressStatusMessage,
          selectedAddress: [''],
          // licenseStatus: address.licenseStatus,
          deaSchedule: address?.deaSchedule,
          isValid: this.isNotValidAddress(address)
        });
        this.address.push(addressForm);
        this.cdr.detectChanges()
      });
    } else {
      const addressForm = this._fb.group({
        HCPFullName: data?.firstName + ' ' + data?.lastName,
        designation: data.designation,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        licenseNumber: data.licenseNumber,
        deaNum: data.deaNum,
        zipCode: data.zipCode,
        fax: data.fax,
        phone: data.phoneNum || data.phone,
        isPreferredAddress: data.isPreferredAddress,
        locationId: data?.addressLocId || data?.locationId,
        sln: this.resolveSLN(data.state),
        addressChecksum: data?.addressCheckSum,
        isChecked: data?.isChecked ? true : false,
        addressStatus: data?.addressStatus,
        addressStatusMessage: data?.addressStatusMessage,
        selectedAddress: [''],
        // licenseStatus: data.licenseStatus,
        deaSchedule: data?.deaSchedule,
        isValid: this.isNotValidAddress(data)

      });
      this.address.push(addressForm);
      this.cdr.detectChanges()
    }
    
    this._CartService.isAddressWarning.next(this.isValidAddress.length > 0 ? true : false)

    const isAddressChecked = this.address.value.find((arr) => {
      return  arr.isChecked == true
    })

    isAddressChecked ? this._CartService.cartAtLeastOneAddressValidStream.next(true) :       
    this._CartService.cartAtLeastOneAddressValidStream.next(false) ;
  }

  resolveSLN(state) {
    this.licenseData = this.licensesArray?.find(el => {
      return el?.licenseState === state;
    });
    return this.licenseData?.licenseNumber;
  }

  ngOnDestroy() {
    if (this.editAddressModalSub) {
      this.editAddressModalSub.unsubscribe();
    }
    if (this.addAddressModalSub) {
      this.addAddressModalSub.unsubscribe();
    }
    this.manageLicenseSubscription?.unsubscribe();
    this.getSelectedProductSub?.unsubscribe();
  }
}
