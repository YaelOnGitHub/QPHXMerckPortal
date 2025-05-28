import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialAccountConfirmationRoutingModule } from './social-account-confirmation-routing.module';
import { SocialAccountConfirmationComponent } from './social-account-confirmation/social-account-confirmation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ResendEmailComponent } from './resend-email/resend-email.component';


@NgModule({
  declarations: [
    SocialAccountConfirmationComponent,
    ResendEmailComponent
  ],
  imports: [
    CommonModule,
    SocialAccountConfirmationRoutingModule,
    SharedModule,
  ]
})
export class SocialAccountConfirmationModule { }
