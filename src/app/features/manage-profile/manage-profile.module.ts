/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManageProfileComponent } from './manage-profile.component';
import { ManageProfileRoutingModule } from './manage-profile-routing.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { ManagePasswordComponent } from './manage-password/manage-password.component';
import { ManageLicenseComponent } from './manage-license/manage-license.component';
import { ManageChangePinComponent } from './manage-change-pin/manage-change-pin.component';
import { TranslateModule } from '@ngx-translate/core';
import { ManageCreatePinComponent } from './manage-create-pin/manage-create-pin.component';
import { ManageSubscriptionsComponent } from './manage-subscriptions/manage-subscriptions.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ManageProfileRoutingModule,
        TabsModule.forRoot(),
        TranslateModule
    ],
    providers: [

    ],
    declarations: [ManageProfileComponent, ProfileManagementComponent, ManageAddressComponent, ManagePasswordComponent, ManageLicenseComponent, ManageChangePinComponent, ManageCreatePinComponent, ManageSubscriptionsComponent]
})
export class ManageProfileModule { }
