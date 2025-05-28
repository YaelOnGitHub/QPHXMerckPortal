/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageSecurityRoutingModule } from './manage-security-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ManageSecurityService } from './service/manage-security.service';
import { SetSecurityComponent } from './set-security/set-security.component';
import { ManageSecurityComponent } from './manage-security.component';
import { CreatePinComponent } from './create-pin/create-pin.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SetPasswordComponent, SetSecurityComponent, ManageSecurityComponent, CreatePinComponent],
  imports: [
    CommonModule,
    ManageSecurityRoutingModule,
    SharedModule,
    TranslateModule
  ],
  exports:[SetPasswordComponent],
  providers: [ManageSecurityService]
})
export class ManageSecurityModule { }
