/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { ManagePasswordComponent } from './manage-password/manage-password.component';
import { ManageLicenseComponent } from './manage-license/manage-license.component';
import { ManageChangePinComponent } from './manage-change-pin/manage-change-pin.component';
import { ManageSubscriptionsComponent } from './manage-subscriptions/manage-subscriptions.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileManagementComponent
  },
  {
    path: 'profile',
    component: ProfileManagementComponent
  },
  {
    path: 'address',
    component: ManageAddressComponent
  },
  {
    path: 'licenses',
    component: ManageLicenseComponent
  },
  {
    path: 'password',
    component: ManagePasswordComponent
  },
  {
    path: 'pin',
    component: ManageChangePinComponent
  },
  {
    path: 'subscriptions',
    component: ManageSubscriptionsComponent
  } 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageProfileRoutingModule { }
