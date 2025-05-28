import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { SrfLinkService } from '../../srf-link/srf-link.service';
@Component({
  selector: 'app-requested-items',
  templateUrl: './requested-items.component.html',
  styleUrls: ['./requested-items.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class RequestedItemsComponent implements OnInit {

  @Input() requestedProductList: any;
  formGroup: FormGroup;
  constructor(private _fb: FormBuilder, private _CartService: CartService, private _cartManagementService: cartManagementService, private _srfService:SrfLinkService) { }
  totalItem: number = 0;
  selectedCity: null;
  configList: any;
  quantityStepperArr: any;
  ngOnInit(): void {
    this.formGroup = this._fb.group({
      product: this._fb.array([])
    });

    this._cartManagementService.getSelectedProductItems().subscribe((selectedProductItem) => {

      this.totalItem = this._cartManagementService.getSelectedItemQuantity(selectedProductItem);

      this._CartService.cartAtLeastOneProductItemValidStream.next(this.totalItem > 0 ? true : false);

      let productItemUpdateWithQ = selectedProductItem?.map((productItem) => {
        return {
          ...productItem,
          productQuantityList: this.getProductQuantityList(productItem)
        }
      });

      const group = productItemUpdateWithQ?.reduce((acc, item) => {
        if (!acc[item.manufacturerName]) {
          acc[item.manufacturerName] = [];
        }
        acc[item.manufacturerName].push(item);
        return acc;
      }, {})

      this.requestedProductList = [];
      this.requestedProductList = group;

    })
  }

  onSubscribe(event,key,product) {
    product.isSubscribed = event.target.checked;
    const updatedProduct = {
      ...product,
      isSubscribed: event?.target.checked || false,
      subscriptionRequired :event?.target.checked || false
    }
    this._cartManagementService.updateProductInToCart(updatedProduct);
  }

  checkSRFStatus(id) {
    if(id && id !== '') {
      return true;
    }
    return false
  }
  
  getProductQuantityList(productItem) {
    let list = [];
    productItem.unitsPerPackage == 0 ? productItem.unitsPerPackage = 1 : productItem.unitsPerPackage;
    for (let i = productItem.unitsPerPackage; i <= productItem.limit; i = i + productItem.unitsPerPackage) {
      list.push({
        qunatityValue: i,
        qunatityLabel: i
      })
    }

    return list;
  }

  onDeleteProduct(selectedProduct) {
    if(selectedProduct.srfId) {
      let params:any = { srfId:selectedProduct.srfId, productId: selectedProduct.id }

      this._srfService.cancelSRF(params).subscribe((res) => {
        if(res) {
          this._cartManagementService.deleteSelectedProductItems(selectedProduct)

          if (this._cartManagementService.getSrfProductCount(selectedProduct.srfId) == 0){
            this._srfService.cancelSRF({ srfId:selectedProduct.srfId}).subscribe((res) => {
              console.log(res)
            })
          }

        }
      });

      return;
    }
    this._cartManagementService.deleteSelectedProductItems(selectedProduct)
  }

}
