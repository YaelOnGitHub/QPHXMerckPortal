/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProductService } from '../service/product.service';
import { ProductFiltersComponent } from '../product-filters/product-filters.component';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { ProductRequestParam } from 'src/app/core/models/product.model';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { debounceTime, distinctUntilChanged, map, Subject, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common-service/common.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  constructor(
    private _productService: ProductService,
    public modalDailog: BsModalService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _commonService: CommonService,
    private _cartManagementService: cartManagementService) {    
       this.getBrandId()
    }

  productList: any = [];
  searchProductValue: any = '';

  brandId = ''
  filterArray: any = [];
  displayProducts: any = [];
  sortValue: any = 'All';
  sortId: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  isBrandEnable: boolean = false;
  page?: number = 0;
  productRequestParam: ProductRequestParam = {
    manufactures: [
    ],
    productTypes: [
    ],
    isNew: false,
    search: "",
    sort: "DESC",
    take: 9,
    skip: 0,
    brandId:""
  }
  oldSubscribedProducts: any = [];
  productFilterStreamSub: Subscription
  productListingAPISub: Subscription;
  searchSubscription: Subscription;
  filterManufacturerArray: any = [];
  filterProductTypeArray: any = [];

  searchSubject = new Subject<string | undefined>();

  productSort = [
    { value: "status", title: "All", class: "all", checked: false },
    { value: "status", title: "Availablity", class: "available", checked: false },
  ];

  getBrandId() {
    this._route?.queryParams.subscribe(params => {
      this.brandId = params['id'] || '';
      this.productRequestParam.brandId = this.brandId;
    })
  }

  onFilterChange() {
    this.productFilterStreamSub = this._productService.productFilterStream$.subscribe(data => {
      if (data) {
        let productTypes = [];
        let manufacturer = [];
        let isNew = false;
        this.displayProducts = this.productList;
        this.filterArray = this._productService.getFilters();
        if (this.filterArray.length > 0) {
          this.filterArray?.forEach(k => {
            if (k.filterName === 'productTypes') {
              productTypes = [...productTypes, k.filterVal]
            } else if (k.filterName === 'manufacturer') {
              manufacturer = [...manufacturer, k.filterVal]
            } else if (k.filterName === 'new') {
              isNew = k.filterVal
            }
          });
          this.productRequestParam = {
            ...this.productRequestParam,
            manufactures: [
              ...manufacturer
            ],
            productTypes: [
              ...productTypes
            ],
            isNew: isNew
          }
          this.getAllItems(this.productRequestParam, 'filter ');
        } else {
          this.productRequestParam = {
            ...this.productRequestParam,
            manufactures: [

            ],
            productTypes: [

            ],
            isNew:isNew
          }
          this.getAllItems(this.productRequestParam, 'filter uncheck');

        }
      }
    });
  }

  onSearchProduct(event: KeyboardEvent, eventTargetValue): void {
    this.searchSubject.next(eventTargetValue)
  }

  onSearchFunction() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(searchText => {
        this.productRequestParam = {
          ...this.productRequestParam,
          search: searchText,
          skip: 0,
          take: 8
        }
        this.getAllItems(this.productRequestParam, 'search');
      })).subscribe((item) => {
      })
  }

  onClearSearch() {
    this.productRequestParam = {
      ...this.productRequestParam,
      search: ''
    }
    this.searchProductValue = '';
    this.getAllItems(this.productRequestParam, 'clear');
  }

  pageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    let param = {
      ...this.productRequestParam,
      skip: (this.page - 1) * this.productRequestParam.take
    }
    this.getAllItems(param, 'pagination');
  }

  onSort(value) {
    this.sortValue = value;
    if (value === 'Availablity') {
      this.sortId = 1
    } else {
      this.sortId = 0
    }
  }

  getAllItems(requestParams, callFrom): void {
    this.productList = [];
    this.displayProducts = [];
    this.productListingAPISub = this._productService.getProductList(requestParams).subscribe((productList) => {
      this.productList = productList?.data?.products;
      this.displayProducts = productList?.data?.products;
      this.totalItems = productList?.data?.totalCount;


      this._cartManagementService.getSelectedProductItems().subscribe((selectedProductList) => {
        this.displayProducts = [];
        this.displayProducts = this.productList?.map((productItem) => {
          return {
            isProductSelected: false,
            selectedQuantity: 0,
            ...productItem
          }
        });

        this.displayProducts?.forEach((parentItem) => {
          selectedProductList?.forEach((childItem) => {
            if (parentItem.id === childItem.id) {
              parentItem.isProductSelected = true
              parentItem.selectedQuantity = childItem.selectedQuantity
              this.oldSubscribedProducts.push({...parentItem})
              parentItem.isSubscribed = childItem.isSubscribed
              
            }
          });
        });
      })
    });

  }

  onRedirectBrandPage() {
   this._router.navigateByUrl('brands');
  }


  // MOBILE FILTER
  onFilterOpen() {
    let initialState = {}
    this.modalDailog.show(ProductFiltersComponent, { initialState, class: 'modal-md alert-model modal-dialog-centered', ignoreBackdropClick: true, keyboard: false });
  }

  ngOnDestroy() {
    if (this.productFilterStreamSub) this.productFilterStreamSub.unsubscribe();
    if (this.productListingAPISub) this.productListingAPISub.unsubscribe();
  }

  ngOnInit(): void {
    let productRequestParam = {
      ...this.productRequestParam,
      manufactures: [],
      productTypes: [],
      brandId: this.brandId !== '' ? this.brandId : null
    }
    this.isBrandEnable = this._commonService.getisBrandEnable()
    this._productService.productFilterStream.next(false);
    this.getAllItems(productRequestParam, 'initial');
    this.onFilterChange();
    this.onSearchFunction();

  }
}
