import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandsWrapperRoutingModule } from './brands-wrapper-routing.module';
import { BrandListComponent } from './brand-list/brand-list.component';
import { BrandsWrapperComponent } from './brands-wrapper.component';
import { BrandService } from './service/brand.service';
import { BrandItemComponent } from './brand-item/brand-item.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    BrandsWrapperComponent,BrandListComponent, BrandItemComponent
  ],
  imports: [
    CommonModule,
    BrandsWrapperRoutingModule,
    SharedModule,
    PaginationModule.forRoot()

  ],
  providers: [BrandService]
})
export class BrandsWrapperModule { }
