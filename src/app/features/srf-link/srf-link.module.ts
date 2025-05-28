import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SrfLinkRoutingModule } from './srf-link-routing.module';
import { SrfLinkConfirmationComponent } from './srf-link-confirmation/srf-link-confirmation.component';
import { SrfLinkModalComponent } from './srf-link-modal/srf-link-modal.component';


@NgModule({
  declarations: [
    SrfLinkConfirmationComponent,
    SrfLinkModalComponent
  ],
  imports: [
    CommonModule,
    SrfLinkRoutingModule
  ]
})
export class SrfLinkModule { }
