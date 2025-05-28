/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductWrapperComponent } from './product-wrapper.component';
import { ProductDetailsModalComponent } from './product-details/product-details.component';

const routes: Routes = [
  {
    path: ':id',
    component: ProductWrapperComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductWrapperRoutingModule { }
