/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductWrapperRoutingModule } from './product-wrapper-routing.module';
import { ProductWrapperComponent } from './product-wrapper.component';
import { ProductDetailsModalComponent } from './product-details/product-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFiltersComponent } from './product-filters/product-filters.component';
import { ProductItemComponent } from './product-item/product-item.component';
import { ProductService } from './service/product.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
 
@NgModule({
  declarations: [ProductWrapperComponent, ProductDetailsModalComponent, ProductListComponent, ProductFiltersComponent, ProductItemComponent],
  imports: [
    CommonModule,
    ProductWrapperRoutingModule,
    SharedModule,
    PaginationModule.forRoot()
  ],
  providers: [ProductService]
})
export class ProductWrapperModule { }
