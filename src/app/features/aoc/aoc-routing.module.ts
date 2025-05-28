import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageAocComponent } from './manage-aoc/manage-aoc.component';

const routes: Routes = [
  {
    path: ':link',
    component: ManageAocComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AocRoutingModule { }
