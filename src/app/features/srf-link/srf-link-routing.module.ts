import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SrfLinkConfirmationComponent } from './srf-link-confirmation/srf-link-confirmation.component';


const routes: Routes = [
  {
    path: ':link',
    component: SrfLinkConfirmationComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrfLinkRoutingModule { }
