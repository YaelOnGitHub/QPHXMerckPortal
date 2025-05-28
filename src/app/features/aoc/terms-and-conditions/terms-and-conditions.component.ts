import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { AocService } from '../aoc.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {
  formGroup: FormGroup;
  @Input() requestedProductList: any;
  termsAndConditionsList: any;
  constructor(private _fb: FormBuilder, private _AocService: AocService) { }



  ngOnInit(): void {
    this.formGroup = this._fb.group({
      termsAndCondition: [null, [Validators.required]],
    });
    this.getTermsAndConditionsByBrands();
  }

  getTermsAndConditionsByBrands() {
    let brands = this.requestedProductList.map((productItem) => {
      return productItem.brandId
    });
    brands.unshift('*');
    let productsTermsConditionsParams = {
      brands
    }
    this._AocService.getProductsTermsConditions(productsTermsConditionsParams).subscribe((termsAndConditionResp) => {
      if (termsAndConditionResp.success) {
        this.termsAndConditionsList = termsAndConditionResp.data.productTermsConditions;
      }
    });
  }

  onChangeTermsAndConditions(checkboxValue) {
    this._AocService.cartTermsAndConditionsValidStream.next(checkboxValue.target.checked);
  }

}
