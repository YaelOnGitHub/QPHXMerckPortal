/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth-service/auth.service';
import AuthInterceptor from '../core/interceptors/auth-interceptor.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { socialClientIdConfig } from '../core/config/social-login.config';
import { SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextInputComponent } from './components/text-input/text-input.component';
import { CommonService } from './services/common-service/common.service';
import { PhoneDirective } from './directives/phone.directive';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IntroHeaderComponent } from './../shared/components/intro-header/intro-header.component';
import { ToastrModule } from 'ngx-toastr';
import { StepperInputComponent } from './components/stepper-input/stepper-input.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertService } from './components/alert/alert.service';
import { ModalControlComponent } from './components/alert/alert-modal-control/modal-control.component';
import { AddEditAddressModalComponent } from './components/add-edit-address/add-edit-address.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { TextDescription } from './pipes/client-config-text-description.pipe';
import { AddEditLicenseModalComponent } from './components/add-edit-license/add-edit-license.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { HeaderFooterSidebarSettingService } from './services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { TranslateModule } from '@ngx-translate/core';
import { cartManagementService } from './services/cart-management-service/cart-management-service';
import { ManageSecurityQuestionModalComponent } from './components/manage-security-question-modal/manage-security-question-modal.component';
import { ToggleButtonComponent } from './components/toggle-button/toggle-button.component';
import { CookieService } from 'ngx-cookie-service';
import { CookieOptionsModalComponent } from './components/cookie-options-modal/cookie-options-modal.component';
import { IdleDetectorComponent } from './components/idle-detector/idle-detector.component';
import { CountdownPipe } from './pipes/countdown.pipe';
import { Insights } from '../core/services/insights.service';
import { LogHttpInterceptor } from '../core/interceptors/log-interceptor.service';


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    DropdownComponent,
    TextInputComponent,
    PhoneDirective,
    IntroHeaderComponent,
    StepperInputComponent,
    ModalControlComponent,
    AddEditAddressModalComponent,
    ChangePasswordComponent,
    TextDescription,
    AddEditLicenseModalComponent,
    SideMenuComponent,
    ManageSecurityQuestionModalComponent,
    ToggleButtonComponent,
    CookieOptionsModalComponent,
    IdleDetectorComponent,
    CountdownPipe
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LogHttpInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [...socialClientIdConfig],
        onError: err => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    AuthService,
    CommonService,
    AlertService,
    HeaderFooterSidebarSettingService,
    cartManagementService,
    CookieService,
    Insights
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterModule,
    TranslateModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-center',      
      preventDuplicates: true,
    }),
    TabsModule.forRoot(),
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    DropdownComponent,
    TextInputComponent,
    IntroHeaderComponent,
    PhoneDirective,
    ModalModule,
    IntroHeaderComponent,
    StepperInputComponent,
    TabsModule,
    ModalControlComponent,
    ChangePasswordComponent,
    TextDescription,
    AddEditLicenseModalComponent,
    SideMenuComponent,
    ManageSecurityQuestionModalComponent,
    ToggleButtonComponent,
    IdleDetectorComponent
  ],
})
export class SharedModule { }
