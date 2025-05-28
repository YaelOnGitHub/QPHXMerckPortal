import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {
  formGroup: FormGroup;
  @Input() requestedProductList: any;
  termsAndConditionsList: any;
  constructor(private _fb: FormBuilder, private _CartService: CartService, private _cartManagementService: cartManagementService) { }



  ngOnInit(): void {
    this.formGroup = this._fb.group({
      termsAndCondition: [null, [Validators.required]],
    });

    this._cartManagementService.cartStore.subscribe((res)=> {
      if(res.length == 0) return
      this.requestedProductList = res
      this.getTermsAndConditionsByBrands()
    })
  }

  getTermsAndConditionsByBrands() {
    let brands = this.requestedProductList.map((productItem) => {
      return productItem.brandId
    });
    brands.unshift('*');
    let productsTermsConditionsParams = {
      brands
    }
    this._CartService.getProductsTermsConditions(productsTermsConditionsParams).subscribe((termsAndConditionResp) => {
      if (termsAndConditionResp.success) {
        this.termsAndConditionsList = termsAndConditionResp.data.productTermsConditions;
      }
    });
  }

  onChangeTermsAndConditions(checkboxValue) {
    this._CartService.cartTermsAndConditionsValidStream.next(checkboxValue.target.checked);
  }

}
