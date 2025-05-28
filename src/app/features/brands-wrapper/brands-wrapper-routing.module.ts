import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandsWrapperComponent } from './brands-wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: BrandsWrapperComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandsWrapperRoutingModule { }
