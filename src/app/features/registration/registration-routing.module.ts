/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeactivateGuard } from 'src/app/core/guards/deactivate.gaurd';
import { HcpSearchComponent } from './hcp-search/hcp-search.component';
import { RegistrationConfirmationComponent } from './registration-confirmation/registration-confirmation.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';

const routes: Routes = [
  {
    path: '',
    component: HcpSearchComponent,
    //reslove
  },
  {
    path: 'new',
    component: RegistrationFormComponent
  },
  {
    path: ':id',
    component: RegistrationFormComponent,
    canDeactivate: [DeactivateGuard],
  },
  {
    path: ':id/success',
    component: RegistrationConfirmationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationRoutingModule { }
