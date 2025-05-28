import { NgModule } from '@angular/core';
import { DataPrivacyRoutingModule } from './data-privacy-routing.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DataPrivacyComponent } from './data-privacy.component';

@NgModule({
  declarations: [
    DataPrivacyComponent,
  ],
  imports: [
    DataPrivacyRoutingModule,
    CommonModule,
    SharedModule
  ],
})


export class DataPrivacyModule { }
