/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoginModule } from '../login/login.module';
import { SocialLoginModule } from '@abacritt/angularx-social-login';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [
    CommonModule,
    LoginModule,
    SocialLoginModule,
    SharedModule,
    LandingPageRoutingModule,
    TranslateModule
  ]
})
export class LandingPageModule {
}
