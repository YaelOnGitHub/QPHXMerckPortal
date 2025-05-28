/* eslint-disable prettier/prettier */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProductDetails } from 'src/app/core/models/product-details.model';
import { SessionService } from 'src/app/shared/services/session.service';
import { cartManagementService } from '../../../shared/services/cart-management-service/cart-management-service'

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsModalComponent implements OnInit {

  @Input() headerData;
  formGroup: FormGroup;
  data: ProductDetails;
  isMultiTenant: boolean;
  action: string;
  oldisSubscribed: boolean
  public quantity: number;
  public isSubscribed: boolean;
  isRecurringShow: boolean = false;
  subscriptionRequired: boolean = false;
  isDefaultWarning: boolean = false;
  subscribeTxt = 'Automated Request';
  subscribeDescription = 'To cancel anytime, go to';
  subscribeDescriptionToolTip = 'To cancel anytime, go to Automated Requests under Manage Profile.';
  boxWarning: '';
  isSubscribeCheckboxDisabled: boolean = false;
  previousQty: number;
  previousSub: boolean;
  itemsToAddInCart = ['id', 'name', 'productTypeCode', 'manufacturerClientId', 'isProductSelected', 'drugSchedule', 'displayName', 'limit', 'description',
    'manufacturerLogo', 'manufacturerName', 'selectedQuantity', 'isSubscribed', 'thumbnailURL', 'unitsPerPackage', 'availableQuantity', 'orderedQuantity', 'isSubscribeable']

  @ViewChild('boxWarning') boxWarningElem: ElementRef<HTMLElement>;

  constructor(
    public _modalRef: BsModalRef,
    private _fb: FormBuilder,
    private _cartManagementService: cartManagementService,
    private _session: SessionService
  ) { }

  ngOnInit() {
    this.isSubscribed = this.data?.isSubscribed;
    const unitsPerPackage = this.data?.unitsPerPackage == 0 ? 1 : this.data?.unitsPerPackage;
    this.previousQty = this.data?.selectedQuantity;
    this.previousSub = this.data?.isSubscribed;
    this.formGroup = this._fb.group({
      quantityStepper: [unitsPerPackage, Validators.required],
      isSubscribed: [this.isSubscribed]
    });
    this.formGroup.patchValue({
      quantityStepper: this.data?.selectedQuantity !== 0 ? this.data.selectedQuantity : unitsPerPackage
    });
    this.isRecurringShow = this.data?.isSubscribeable !== null ? this.data.isSubscribeable : false;

    const checkIfAlreadyEdited = this.action == 'edit' && !this.oldisSubscribed
    const val = this.data?.isSubscribed || false;

    if (val && (!checkIfAlreadyEdited || this.checkifSRFProduct())) {
      this.formGroup.controls['isSubscribed'].disable();
      this.isSubscribeCheckboxDisabled = true;
      this.subscribeDescription = this.data?.isSubscribed ? 'You are already subscribed. Go to ' : this.subscribeDescription;
      this.subscribeDescriptionToolTip = this.data?.isSubscribed ? 'You are already subscribed. Go to Automated Requests under Manage Profile' : this.subscribeDescriptionToolTip;
    } else {
      this.formGroup.controls['isSubscribed'].enable();
      this.isSubscribeCheckboxDisabled = false;
    }

    this.subscribeTxt =  'Automated Request'
    this.boxWarning = this._session.get('brandWarningBox') || '';
    this.isDefaultWarning = this._session.get('isDefaultWarning') || '';
  }

  checkifSRFProduct() {
    let selectedProduct = [this.data];
    let product;
    this._cartManagementService.getCurretnProductValue().forEach((item) => {
      if (item.id?.includes(selectedProduct[0].id)) {
        product = item
      }
    });
    return this.isSRFValid(product)
  }

  isSRFValid(obj): boolean {
    if(!obj) return false
    return obj.hasOwnProperty('srfId') && !!obj.srfId;
  }

  closeModal() {
    this._modalRef.hide();
  }

  ngAfterViewInit() {
    if (this.boxWarning && this.boxWarning !== '') {
      this.boxWarningElem.nativeElement.insertAdjacentHTML('beforeend', this.boxWarning);
    }
  }

  onSubscribe(event) {
    this.subscriptionRequired = event.target.checked || false;
    this.isSubscribed = event.target.checked || false;
    this.subscribeTxt =  'Automated Request'
  }

  onAddProduct() {
    let isUpdate = false;
    let selectedProduct = [this.data];
    this.quantity = this.formGroup.get('quantityStepper')?.value;
    const prod = Object.keys(selectedProduct[0]).reduce((acc, key) => {
      if (this.itemsToAddInCart.includes(key)) {
        acc[key] = selectedProduct[0][key]
      }
      return acc;
    }, {})

    prod['brandId'] = selectedProduct[0]?.brandList[0]?.brandID;
    
    const isEdited = this.action == 'edit' && !this.oldisSubscribed
    let previouslySubscribed = isEdited ? this.formGroup.get('isSubscribed')?.value : prod['isSubscribed'];
    previouslySubscribed = prod['isSubscribed'] ? previouslySubscribed : false;

    this._cartManagementService.getCurretnProductValue().forEach((item) => {
      if (item.id?.includes(selectedProduct[0].id)) {
        isUpdate = true;
      }
    });

    if(isUpdate && !this.isSubscribeCheckboxDisabled && (this.previousQty == this.quantity && this.previousSub == this.formGroup.get('isSubscribed')?.value)) {
      this.closeModal()
      return;
    }

    if(isUpdate && !this.isSubscribeCheckboxDisabled && (this.previousQty !== this.quantity && this.previousSub == this.formGroup.get('isSubscribed')?.value)) {
      this.closeModal()
      return;
    }

    let updateWithQuantity = {
      ...prod,
      selectedQuantity: this.quantity,
      subscriptionRequired: this.subscriptionRequired,
      previouslySubscribed: previouslySubscribed,
      isSubscribed: this.formGroup.get('isSubscribed')?.value
    }

   
    if (isUpdate) {
      this._cartManagementService.updateProductInToCart(updateWithQuantity);
    } else {
      this._cartManagementService.addProductInToCart(updateWithQuantity);
    }
    this.closeModal();
  }

  accessLink(url?: string) {
    let a = document.createElement('a');
    a.target = '_blank';
    a.href = url;
    a.click();
  }

  getProductName(product) {
    return product?.displayName || product?.name;
  }

  getProductStatus(selecteStatusId): any {
    return selecteStatusId.toLowerCase();
  }

  ngOnDestroy() {
    this.closeModal()
  }

}