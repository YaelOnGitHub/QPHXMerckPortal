/* eslint-disable prettier/prettier */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { API_Response } from 'src/app/core/models/common.model';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { ProductService } from '../service/product.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductFiltersComponent implements OnInit, OnDestroy {

  manufacturerArray: any = [];
  productTypeArray: any = [];
  filterArray: Array<any>;
  manufacturerSubscription: Subscription;
  newCheck: boolean = false;
  constructor(private _productService: ProductService, private _authService: AuthService, public bsModalRef: BsModalRef, private _commonService: CommonService) { }

  ngOnInit(): void {

    let configList = this._authService.getUserConfiguration();
    
      this.manufacturerSubscription = this._productService.getProductFilters().subscribe((res: API_Response) => {
        if (res.success) {
          // if brand enabled then add following check
          const isBrandEnable = this._commonService.getisBrandEnable();
          if(isBrandEnable == false)
          {
            this.manufacturerArray = configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? res?.data['manufacturerFilters'] : null;
          }          
          this.productTypeArray =  res?.data['productTypeFilters'];
        }
      });

    this.getFilterArray();
  }

  getFilterArray() {
    this.filterArray = this._productService.getFilters();
  }

  valuechange(e, item, filterKey) {
    if (item !== null) {
      item.isChecked = !item.isChecked;
    }
    if (filterKey === 'productTypes') {
      if (e.target.checked) {
        this.filterArray.push({
          filterName: filterKey,
          filterVal: item.productTypeId
        })
      }
      else {
        this.filterArray.splice(this.filterArray.findIndex(e => e.filterVal === item.productTypeId),1);
      }
      this._productService.setFilters(this.filterArray);
    }
    else if (filterKey === 'manufacturer') {
      if (e.target.checked) {
        this.filterArray.push({
          filterName: filterKey,
          filterVal: item.manufacturerId
        })
      }
      else {
        this.filterArray.splice(this.filterArray.findIndex(e => e.filterVal === item.manufacturerId));
      }
      this._productService.setFilters(this.filterArray);
    } else if (filterKey === 'new') {
      if (e.target.checked) {
        this.filterArray.push({
          filterName: filterKey,
          filterVal: true
        });
        this.newCheck = true;
      }
      else {
        this.filterArray.push({
          filterName: filterKey,
          filterVal: false
        });
        this.newCheck = false;
      }
      this._productService.setFilters(this.filterArray);
    }

  }

  resetFilter() {
    this.manufacturerArray?.map(filter => {
      filter.isChecked = false;
    })
    this.productTypeArray?.map(filter => {
      filter.isChecked = false;
    });
    this.newCheck = false;
    this.filterArray = []
    this._productService.resetFilter();
  }

  onAllFilters() {
    this._productService.setFilters(this.filterArray);
    this.bsModalRef.hide();
  }

  onCloseModal() {
    this.bsModalRef.hide();
  }

  ngOnDestroy() {
    this.manufacturerSubscription?.unsubscribe();
    this.filterArray = []
    this._productService.clearFilters();
  }
}
