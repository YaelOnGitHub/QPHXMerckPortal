import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { BrandRequestParam } from 'src/app/core/models/brands.model';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { BrandService } from '../service/brand.service';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss']
})
export class BrandListComponent implements OnInit {

  brandListSub: Subscription;
  searchBrandValue = new FormControl("");
  allBrandsList = [];
  totalItems = 0;
  itemsPerPage = 100
  page = 0;
  brandRequestParam: BrandRequestParam = {
    manufactures: [
    ],
    productTypes: [
    ],
    isNew: false,
    search: "",
    sort: "ASC",
    take: this.itemsPerPage,
    skip: 0,
  }
  constructor(private _brandService: BrandService, private _loader: LoaderService) { 
    this._loader.show(null)
  }

  ngOnInit(): void {
    this.getAllBrands(this.brandRequestParam);
    this.searchBrands();
  }

  onChangeSorting() {
    const sortType = this.brandRequestParam.sort === 'ASC' ? 'DESC' : 'ASC';
    this.brandRequestParam = {
      ...this.brandRequestParam,
      sort: sortType
    }
    this.getAllBrands(this.brandRequestParam)

  }

  searchBrands() {
    this.searchBrandValue?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(() => {
        this.brandRequestParam = {
          ...this.brandRequestParam,
          search: this.searchBrandValue?.value,
        }
        this.getAllBrands(this.brandRequestParam)
      })
    ).subscribe(() => {
    })
  }

  pageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    let param = {
      ...this.brandRequestParam,
      skip: (this.page - 1) * this.brandRequestParam.take
    }
    this.getAllBrands(param);
  }
  
  onClearSearch() {
    this.searchBrandValue.setValue("")
  }

  getAllBrands(params) {
    this.brandListSub = this._brandService.getBrandList(params).subscribe((brandList) => {
      this.allBrandsList = brandList?.data?.brands;
      this.totalItems = brandList?.data?.totalCount;
    })
  }

}
