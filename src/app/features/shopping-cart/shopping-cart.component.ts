import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { CartService } from './service/cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderSubmissionRequestParams } from 'src/app/core/models/order-submission.model';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ManageSecurityQuestionModalComponent } from '../../shared/components/manage-security-question-modal/manage-security-question-modal.component';
import { Subscription, take } from 'rxjs';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { OrderPlaceVerificationType } from 'src/app/shared/enums/order-place-verification-type';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { Constants } from 'src/app/core/utilities/constants';
import { TdddConfirmationComponent } from './tddd-confirmation/tddd-confirmation.component';
import {Location} from '@angular/common';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { TextDescription } from 'src/app/shared/pipes/client-config-text-description.pipe';
import { SessionService } from 'src/app/shared/services/session.service';
import { StorageType } from 'src/app/shared/enums/storage-type';
import { SrfDeliveryComponent } from './srf-delivery/srf-delivery.component';


@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']

})
export class ShoppingCartComponent implements OnInit {

  constructor(
    private _router: Router,
    private _alertService: AlertService,
    private _authService: AuthService,
    private _hfs: HeaderFooterSidebarSettingService,
    private _cartManagementService: cartManagementService,
    private _CartService: CartService,
    private _commonService:CommonService,
    private _fb: FormBuilder,
    private _modalService: BsModalService,
    public _manageSecurityQuestion: BsModalRef,
    public _tdddModalRef: BsModalRef,
    private _toster: ToastrService,
    private _location : Location,
    private _entitlement: EntitlementService,
    private _session: SessionService
    ) { 



    }

  requestedProductList: any = [];
  totalItem: number = 0;
  selectedAddressId: string = null;
  isTermAndConditionValid: Boolean = false;
  isAtLeastOneProductItemValid: Boolean = false;
  isAtLeastOneAddressValid: Boolean = false;
  isAddressDisable: Boolean = false
  formGroup: FormGroup;
  configList: any;

  submitValidationMsg = '';
  tdddModalSub: Subscription;
  forgotPinSubscription: Subscription;
  tncSub: Subscription;
  getSelectedProductSub: Subscription;
  atLeastOneSub: Subscription;
  atLeastOneAddress: Subscription;
  tddModalSaved: Subscription;
  srfDeliveryModalSaved:Subscription;
  isAddressWarning: Subscription;
  onPlaceSingleManufactureOrderSub: Subscription;
  onPlaceMultiManufactureOrderSub: Subscription;

  PREFERRED_VERIFICATION_METHOD: number;
  IS_PIN_AUTHENTICATION = OrderPlaceVerificationType.PIN;
  IS_PASSWORD_AUTHENTICATION = OrderPlaceVerificationType.Passowrd;
  CONTROLLED_PRODUCT_TYPES: any;
  deliveryDays:string;
  IS_PREFERRED_DAYS:boolean=false;

  ngOnInit(): void {

    this._hfs.hfsSetting.next({
      isHeader: true,
      isAuthHeader: true,
      isFooter: true,
      isSidebar: true,
    });

    this.IS_PREFERRED_DAYS = this._entitlement.hasEntitlementMatchForOrderPlace('PREFFERED_DELIVERY_DAYS') ? true : false;
  
    this.PREFERRED_VERIFICATION_METHOD =
      parseInt(this._entitlement.hasEntitlementMatchForOrderPlace('PREFERRED_VERIFICATION_METHOD'));

    this.CONTROLLED_PRODUCT_TYPES = JSON.parse(this._entitlement.keyValueJSON('CONTROLLED_PRODUCT_TYPES')).DrugTypes.filter((prd) => {
      if(prd.Type == 'ControlledSubstance') {
          return prd
      }
    })

    this.configList = this._authService.getUserConfiguration();

    this.srfDeliveryModalSaved = this._CartService.srfDeliveryModalSaved.subscribe((res) => {
      if(res && res !== null) {
        this.manageSrfDeliveryResponse(res)
      }
    })

    this.tddModalSaved = this._CartService.tddModalSaved.subscribe((res) => {
      if(res && res !== null) {
        this.manageTddResponse(res)
      }
    })


    
    this.isAddressWarning = this._CartService.isAddressWarning.subscribe((res) => {
      this.isAddressDisable = res;
    })

    this.getSelectedProductSub = this._cartManagementService
      .getSelectedProductItems()
      .subscribe(selectedProductItem => {
        this.totalItem = this._cartManagementService.getSelectedItemQuantity(selectedProductItem)
        this.requestedProductList = selectedProductItem;
      });

    this.tncSub = this._CartService.cartTermsAndConditionsValidStream$.subscribe(
      isTermAndConditionValid => {
        this.isTermAndConditionValid = isTermAndConditionValid;
      }
    );

    this.atLeastOneSub = this._CartService.cartAtLeastOneProductItemValidStream$.subscribe(
      isAtLeastOneProductItemValid => {
        this.isAtLeastOneProductItemValid = isAtLeastOneProductItemValid;
      }
    );

    this.atLeastOneAddress = this._CartService.cartAtLeastOneAddressValidStream$.subscribe((res) => {
      this.isAtLeastOneAddressValid = res;
    })

    this.formGroup = this._fb.group({
      createPin: [
        '',
        [Validators.minLength(4), Validators.maxLength(4)],
      ],
      password: ['']
    });

    if (this.PREFERRED_VERIFICATION_METHOD === this.IS_PIN_AUTHENTICATION) {
      this.formGroup.get('createPin').setValidators([Validators.required]);
      this.formGroup.get('password').clearValidators();
    } else if (this.PREFERRED_VERIFICATION_METHOD === this.IS_PASSWORD_AUTHENTICATION) {
      this.formGroup.get('password').setValidators([Validators.required]);
      this.formGroup.get('createPin').clearValidators();
    } else {

    }

  }

  getMessageForConfigByKey(key:string): any{
    let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === key;
    });

    return data[0].keyValueHtml;
  }

  checkPinPattern(formControlName){
    let value = this.formGroup.controls[formControlName].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      createPin: numbers,
    });
  }

  onSubmit() {

    const addressLocId = this._CartService.getSelectedAddressItem()?.addressLocId;
    let productList = this.getProductList()

    this.saveUserActivity(addressLocId, productList, "SubmitProduct");


    if (this.checkSubmitValidations(productList)) {
      // this._toster.error(this.submitValidationMsg)
      this.showValidationMsg()
      return;
    }

    if(this.showSrfDeliveryMechanism(productList)){
      this._tdddModalRef = this._modalService.show(
        SrfDeliveryComponent,
        {
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        });
    }
    else{
      const state = this._CartService.getSelectedAddressItem()?.state;
      if (state?.toLowerCase() === 'oh') {
        let initialState = {
          productList: [...productList]
        };
  
        this._tdddModalRef = this._modalService.show(
          TdddConfirmationComponent,
          {
            initialState,
            ignoreBackdropClick: true,
            class: 'modal-md modal-dialog-centered',
          });
  
      } else {
        this.manageTddResponse([])
      }

    }

  }

  showSrfDeliveryMechanism(productList){

     productList = productList.filter(obj => obj.isSubscribed !== null);

     if(productList.every(obj=> obj.srfId)){
      return false;
    }
  
    if (productList.length > 1 && productList.every(obj => obj.subscriptionRequired === true && obj.isSubscribed != null) && productList.some(obj => obj.srfId)) {
      return true; 
      } 

      if (
        productList.length > 1 &&
        productList.some(obj => obj.subscriptionRequired === false && obj.isSubscribed != null) &&
        productList.some(obj => obj.srfId) &&
        productList.some(obj => obj.subscriptionRequired === true && (obj.srfId === null || obj.srfId === undefined))
      ) {
        return true; 
      }
      
      if (productList.length > 1 &&   productList.every(obj => obj.subscriptionRequired === false && obj.isSubscribed != null) && productList.some(obj => obj.srfId)) {
        return false; 
      }

     

      if (productList.length > 1 &&   productList.some(obj => obj.subscriptionRequired === false && obj.isSubscribed != null) && productList.some(obj => obj.srfId)) {
        return false; 
      }

    if(productList.every(obj=> obj.subscriptionRequired === false)){
      return false;
    }

    

    let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === 'SRF_DELIVERY_PARAGRAPH_DESCRIPTION_TEXT';
    });

    if(!data || !data[0]['keyValueHtml']){

      return false;
    }

    if (productList.length > 1) {
        if (
          productList.some(obj => obj.subscriptionRequired === false) &&
          productList.some(obj => obj.srfId)
        ) {

            return false;
        }
    
        const hasSubscribedProduct = productList.some(obj => obj.subscriptionRequired === true && obj.isSubscribed === true);
        const hasVirtualCoupon = productList.some(obj => obj.isSubscribed === null && obj.subscriptionRequired === false);
    
        if (hasSubscribedProduct && hasVirtualCoupon) {

            return true;
        }
    }

    return true;
  }

  manageSrfDeliveryResponse(modalContent){
    let productList = this.getProductList()
    const state = this._CartService.getSelectedAddressItem()?.state;
    if (state?.toLowerCase() === 'oh') {
      let initialState = {
        productList: [...productList]
      };

      this._tdddModalRef = this._modalService.show(
        TdddConfirmationComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        });

    } else {
      this.manageTddResponse([])
    }

  }

  manageTddResponse(modalContent) {
    let productList = this.getProductList()
    let tdddId = null
    let tdddExemptReasonCd = null
    let tdddExemptReasonDescription = null

    if (modalContent) {
      tdddId = modalContent?.tddExemption === false ? modalContent?.tdddNumber : null,
      tdddExemptReasonCd = modalContent?.tddExemption === true ? modalContent?.tdddExemptReason : null
      tdddExemptReasonDescription = modalContent?.tddExemption === true ? modalContent?.tdddExemptReasonDescription : null
    }

    const faxInfo = this._CartService.getFax()
    let fax = ''
    if(faxInfo && faxInfo['srfDelivery']){
      fax = faxInfo['faxNumber']
    }

    let orderPlaceRequestParam: OrderSubmissionRequestParams = {
      pin: this.PREFERRED_VERIFICATION_METHOD === this.IS_PIN_AUTHENTICATION ? this.formGroup.get('createPin')?.value : '',
      password: this.PREFERRED_VERIFICATION_METHOD === this.IS_PASSWORD_AUTHENTICATION ? this.formGroup.get('password')?.value : '',
      orderType: 'DTP',
      addressId: this._CartService.getSelectedAddress(),
      comments: 'place request',
      products: [...productList],
      tdddId: tdddId,
      tdddExemptReasonCd: tdddExemptReasonCd,
      tdddExemptReasonDescription: tdddExemptReasonDescription,
      deliveryDays: this.deliveryDays,
      fax:fax

    };

    if (this.configList[0].clientId === 'QPHMA') {
      this.onPlaceMultiManufactureOrder(orderPlaceRequestParam);
    } else {
      this.onPlaceSingleManufactureOrder(orderPlaceRequestParam);
    }

  }



  getProductList() {
    return this.requestedProductList.map(productItem => {
      return {
        brandId: productItem?.brandId,
        productId: productItem?.id,
        productName: productItem?.name,
        productDescription: productItem?.description || productItem?.name,
        orderQuantity: productItem?.selectedQuantity,
        subscriptionRequired: productItem?.subscriptionRequired,
        isSubscribed: productItem?.isSubscribed,
        productType: productItem?.productTypeCode,
        drugSchedule: productItem?.drugSchedule || null,
        ...(productItem?.srfId !== '' ? {srfId : productItem?.srfId} : null),
        ...(this.configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID
          ? { ManufactureClientId: productItem?.manufacturerClientId }
          : null),
      };
    });
  }



  checkDEAValidation(controlSubstance) {
    const selectedAddress = this._CartService.getSelectedAddressItem()
    if (selectedAddress.deaNum !== null  && selectedAddress.addressStatus?.toLowerCase() == 'valid') {
      return false;
    }
    this.submitValidationMsg = `You are not eligible to receive the following product(s) at the selected address due to federal and/or state regulations. In order to proceed you must either remove the product(s) or select another address that has a valid DEA and/or CDS license.
     ${controlSubstance.toString()}`;
    return true
  }

  checkDrugScheduleValidation() {
    let selectedAddress = this._CartService.getSelectedAddressItem().deaSchedule?.split(',');
    const notAllowedProductCode = this.CONTROLLED_PRODUCT_TYPES.map(prd => parseInt(prd.Code))

    const drugSchedule = []
    for (let i = 0; i < this.requestedProductList.length; i++) {
      if (!selectedAddress?.includes(this.requestedProductList[i].drugSchedule) && (this.requestedProductList[i].drugSchedule !== '') && notAllowedProductCode.includes(this.requestedProductList[i].productTypeCode)) {
        drugSchedule.push(`<li>${this.requestedProductList[i].displayName}</li>`)
      }
    }

    if (drugSchedule.length !== 0) {
      this.submitValidationMsg = `You are not eligible to receive the following product(s) at the selected address due to federal and/or state regulations. In order to proceed you must either remove the product(s) or 
      select another address that has a valid DEA and/or CDS license. <br> <br>  ${drugSchedule.toString().replaceAll(",",'')}`;
    }
   return drugSchedule.length !== 0 ? true : false;
  }


  /**
   * Check Control subtance and Drug validations
   * @param productList 
   * @returns 
   */
  checkSubmitValidations(productList) {
    const controlSubstance = this.controllSubstanceProducts(productList)

    if (controlSubstance.length !== 0) {
      const deaValidation = this.checkDEAValidation(controlSubstance) // DEA Validation
      const drugValidation = this.checkDrugScheduleValidation()  // Drug Validation
      return (deaValidation || drugValidation)
    }
    return false
  }

  controllSubstanceProducts(productList) {
    const existingProductIndex = [];
    const notAllowedProductCode = this.CONTROLLED_PRODUCT_TYPES.map(prd => parseInt(prd.Code))
    productList.map((product, index) => {
      if (notAllowedProductCode.includes(product.productType)) {
        existingProductIndex.push(index + 1)
      }
    });
    return existingProductIndex;
  }

  showValidationMsg() {
    this._alertService
    .warning({
      Heading: '',
      SubHeading: '',
      okBtnText: 'OK',
      isRequiredOkBtn: true,
      textAligment: true,
      extraText: this.submitValidationMsg,
      icon: '',
    })
  }



  saveUserActivity(addressLocId:any, productList:any, action:string) {

    let activityMetadata = JSON.stringify({addressLocId:addressLocId, productList:productList})
    // Define the activity log structure
    const activityLog = {
      activityMetaData:activityMetadata,
      action: action
    };
  
    // Send the activity log to the server
    this._commonService.addUserActivity(activityLog).subscribe({
      next: response => {
        console.log('User activity logged successfully', response);
      },
      error: error => {
        console.error('Error logging user activity', error);
      },
      complete: () => {
        console.log('User activity logging complete');
      }
    });
    
  }

  onPlaceSingleManufactureOrder(orderPlaceRequestParam) {

    this.onPlaceSingleManufactureOrderSub = this._CartService
      .onPlaceSingleManufactureOrder(orderPlaceRequestParam)
      .subscribe({
        next: orderSubmissionResponse => {
          if (
            orderSubmissionResponse.success &&
            orderSubmissionResponse.data?.isOrderPlaced
          ) {
            this._alertService
              .confirm({
                Heading: 'The request has been successfully submitted.',
                isCustomTitle: true,
                customTitle: 'Request Confirmation',
                SubHeading: 'Request Number:',
                okBtnText: 'Back to Homepage',
                isRequiredOkBtn: true,
                extraText: `<strong class="primary">${orderSubmissionResponse.data?.orderNumber}</strong>`,
                icon: 'fa-check',
              })
              .subscribe(result => {
                // if (result) {
                  this.clearCartManagmentServices();
                  this._router.navigateByUrl('products');
                // }
              });
          } else {
            this._toster.error(orderSubmissionResponse.message)
            this.clearCartManagmentServices();
          }
        },
        error: error => {
          if (error.apiMessageCode != "BAD_REQUEST_INVALID_TDDD"){
            return;
          }
         let customTitle = this.getMessageForConfigByKey('TDDD_NOT_EXISTS_MESSAGE');

          this._alertService
          .confirm({
            Heading: '',
            SubHeading: '',
            customTitle: 'TDDD validation error',
            isCustomTitle: true,
            okBtnText: 'Proceed',
            cancelBtnText: 'Cancel',
            isRequiredOkBtn: true,
            isRequiredCancelBtn: true,
            extraText:customTitle,
            icon: '',
          })
          .subscribe(result => {
            if (result) {
              this.onSubmit();
            }
          });
        }
    });
  }

  onPlaceMultiManufactureOrder(orderPlaceRequestParam) {
    this.onPlaceMultiManufactureOrderSub = this._CartService
      .onPlaceMultiManufactureOrder(orderPlaceRequestParam)
      .subscribe({
        next:orderSubmissionResponse => {
        if (
          orderSubmissionResponse.success &&
          orderSubmissionResponse.data?.orderNumbers
        ) {
          this._alertService
            .confirm({
              Heading: 'The request has been successfully submitted.',
              SubHeading: 'Request Confirmation',
              okBtnText: 'Back to Homepage',
              isRequiredOkBtn: true,
              isMultiTenantOrderSubmission: true,
              orderSubmissionData: orderSubmissionResponse?.data,
              extraText: `<strong class="primary">${orderSubmissionResponse.data?.orderNumbers}</strong>`,
              icon: 'fa-check',
            })
            .subscribe(result => {
              // if (result) {
                this.clearCartManagmentServices();
                this.onRedirectToProductPage();
              // }
            });
        } else {
          this.clearCartManagmentServices();
        }
      },
      error: error => {
        if (error.apiMessageCode != "BAD_REQUEST_INVALID_TDDD"){
          return;
        }
       let customTitle =this.getMessageForConfigByKey('TDDD_NOT_EXISTS_MESSAGE');

        this._alertService
        .confirm({
          Heading: '',
          SubHeading: '',
          customTitle: 'TDDD validation error',
          isCustomTitle: true,
          okBtnText: 'Proceed',
          cancelBtnText: 'Cancel',
          isRequiredOkBtn: true,
          isRequiredCancelBtn: true,
          extraText:customTitle,
          icon: '',
        })
        .subscribe(result => {
          if (result) {
            this.onSubmit();
          }
        });
      }
    });
  }

  clearCartManagmentServices() {
    this._cartManagementService.clearProductStore();
    this._CartService.cartTermsAndConditionsValidStream.next(false);
    this._CartService.cartAtLeastOneProductItemValidStream.next(false);
    this._CartService.cartAtLeastOneAddressValidStream.next(false)
    this._CartService.tddModalSaved.next(null)
    this._CartService.srfDeliveryModalSaved.next(null)
  }

  onCancelOrder() {
    this._alertService
      .confirm({
        Heading: 'Do you want to cancel the request?',
        SubHeading: '',
        customTitle: 'Confirm action',
        isCustomTitle: true,
        okBtnText: 'Yes',
        cancelBtnText: 'Cancel',
        isRequiredOkBtn: true,
        isRequiredCancelBtn: true,
        icon: 'fa-times',
      })
      .subscribe(result => {
        if (result) {
          this.clearCartManagmentServices();
          this.onRedirectToProductPage();
        }
      });


      const state = this._CartService.getSelectedAddressItem()?.state;
      const addressLocId = this._CartService.getSelectedAddressItem()?.addressLocId;
      let productList = this.getProductList()
  
      this.saveUserActivity(addressLocId, productList,"CancelRequest");
  }

  forgotPin() {
    let initialState = {
      data: ''
    }
    this._manageSecurityQuestion = this._modalService.show(ManageSecurityQuestionModalComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered' })
    this.forgotPinSubscription = this._modalService.onHide.pipe(take(1)).subscribe(res => {
      if (this._manageSecurityQuestion?.content?.success) {
        this._router.navigate(['security/create-pin']);
      }
    })
  }

  forgotPassword() {
    this._router.navigate(['security/create-pin']);
  }

  onRedirectToProductPage() {
    this._commonService.redirectActivatedRoute()
  }


  ngOnDestroy() {
    this.forgotPinSubscription?.unsubscribe();
    this.tncSub?.unsubscribe();
    this.getSelectedProductSub?.unsubscribe();
    this.atLeastOneSub?.unsubscribe();
    this.atLeastOneAddress?.unsubscribe();
    this.onPlaceSingleManufactureOrderSub?.unsubscribe();
    this.onPlaceMultiManufactureOrderSub?.unsubscribe();
    this.forgotPinSubscription?.unsubscribe();
    this.tddModalSaved?.unsubscribe()
    this.isAddressWarning?.unsubscribe();
    this._alertService.closeAllModals();
    this.srfDeliveryModalSaved?.unsubscribe()

    // this._CartService?.tddModalSaved?.unsubscribe()
  }
  
  receiveDeliveryDate(data: string){
    this.deliveryDays=data;
  }
}
