import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from './faq.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FaqRoutingModule } from './faq-routing.module';

@NgModule({
  declarations: [
    FaqComponent,
  ],
  imports: [
    CommonModule,
    FaqRoutingModule,
    SharedModule,
  ],
})


export class FaqModule { }
