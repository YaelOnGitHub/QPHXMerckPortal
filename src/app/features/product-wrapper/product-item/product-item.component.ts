/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { productStatusEN } from 'src/app/core/utilities/product-constants';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { CartService } from '../../shopping-cart/service/cart.service';
import { ProductDetailsModalComponent } from '../product-details/product-details.component';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})

export class ProductItemComponent {
  configList:any;
  isMultiTenant: boolean = false;
  isDefaultWarning: boolean = false
  boxWarning: '';
  @ViewChild('boxWarning') boxWarningElem: ElementRef<HTMLElement>;

  constructor(private _modalRef: BsModalRef, private _modalService: BsModalService,
     private _cartService: CartService, private _session:SessionService,
     private _authService: AuthService, private _common: CommonService) { }
  @Input() productItem: any = {}
  @Input() oldSubscribedProducts: any = {}
  
  ngOnInit(): void {
    this.configList = this._authService.getUserConfiguration();
    this.isMultiTenant = this.configList[0].clientId !== APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false; 
    this.boxWarning = this.productItem?.boxWarning !== null ? this.productItem?.boxWarning : this.productItem?.boxWarningDefault;
    this.isDefaultWarning  = this._session.get('isDefaultWarning') || ''; 

    //If we have product's boxWarning exists , we are alsways showing black border outside
    if( this.productItem?.boxWarning !== null){
      this.isDefaultWarning =  false;
      this._session.setItem('isDefaultWarning',this.isDefaultWarning)
    }
  }

  ngAfterViewInit() {
    if (this.boxWarning && this.boxWarning !== '') {
      this.boxWarningElem.nativeElement.insertAdjacentHTML('beforeend', this.boxWarning);
    }
  }
  

  getProductStatus(selecteStatusId): any {
    let statusObj: any = '';
    productStatusEN.values.forEach((status) => {
      if (status?.title.includes(selecteStatusId)) {
        statusObj = status
      }
    });
    return statusObj;
  }

  downloadLink(product) {
    if(product?.downloadItemLink) {

      this.saveUserActivity();
      let a = document.createElement('a');
      a.target = '_blank';
      a.href = product.downloadItemLink;
      a.click();
    }
  }

  saveUserActivity() {
    // Define the activity log structure
    const activityLog = {
      activityMetaData: this.productItem.id,
      action: 'Download'
    };
  
    // Send the activity log to the server
    this._common.addUserActivity(activityLog).subscribe({
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
  

  openProductDetails(action) {
    const oldProduct = this.oldSubscribedProducts.find(prd => prd.id == this.productItem.id);
    if(this.boxWarning){
      this._session.setItem('brandWarningBox',this.boxWarning);
    }
   
    let initialState = {
      data: this.productItem,
      isMultiTenant: this.isMultiTenant,
      action : action,
      oldisSubscribed: oldProduct?.isSubscribed || false
    };

    this._modalRef = this._modalService.show(ProductDetailsModalComponent, { initialState: initialState, ignoreBackdropClick: true, class: 'modal-lg modal-dialog-centered' });
    this._modalService.onHide.pipe(take(1)).subscribe((res) => {
      if (this._modalRef?.content?.quantity) {
        this._cartService.addToCart({ id: this.productItem.id, count: this._modalRef?.content?.quantity });
      }
    });
  }

  getProductName(product) {
    return product?.displayName || product?.name;
  }
}
