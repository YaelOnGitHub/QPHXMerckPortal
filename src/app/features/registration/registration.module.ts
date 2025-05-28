/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationRoutingModule } from './registration-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HcpSearchComponent } from './hcp-search/hcp-search.component';
import { RegistrationFormComponent } from 'src/app/features/registration/registration-form/registration-form.component';
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from "ng-recaptcha";
import { environment } from 'src/environments/environment';
import { RegistrationConfirmationComponent } from './registration-confirmation/registration-confirmation.component';
import { RegistrationComponent } from './registration.component';
import { DeleteLicenseOrAddressModalComponent } from './delete-license-address/delete-license-address-modal.component';
import { AddEditAddressModalComponent } from './add-edit-address/add-edit-address-modal.component';
import { TranslateModule } from '@ngx-translate/core';

const globalSettings: RecaptchaSettings = { siteKey: environment.reCaptchaSiteKey };
@NgModule({
    imports: [
        CommonModule,
        RegistrationRoutingModule,
        SharedModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        TranslateModule
    ],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: { ...globalSettings } as RecaptchaSettings,
        },
    ],
    declarations: [RegistrationComponent,
        RegistrationFormComponent,
        HcpSearchComponent,
        RegistrationConfirmationComponent,
        DeleteLicenseOrAddressModalComponent,
        AddEditAddressModalComponent]
})
export class RegistrationModule { }
