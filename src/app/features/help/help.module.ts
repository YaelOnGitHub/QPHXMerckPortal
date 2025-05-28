import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HelpRoutingModule } from './help-routing.module';

@NgModule({
  declarations: [
    HelpComponent,
  ],
  imports: [
    CommonModule,
    HelpRoutingModule,
    SharedModule,
  ],
})


export class HelpModule { }
