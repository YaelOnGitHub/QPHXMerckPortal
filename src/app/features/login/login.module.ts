/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { SocialLoginModule } from '@abacritt/angularx-social-login';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SocialLoginModule,
        LoginRoutingModule,
    ],
    providers: [

    ],
    declarations: [LoginComponent],
    exports: [LoginComponent]
})
export class LoginModule { }
