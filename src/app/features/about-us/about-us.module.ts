import { NgModule } from '@angular/core';
import { AboutUsComponent } from './about-us.component';
import { AboutUsRoutingModule } from './about-us-routing.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    AboutUsComponent,
  ],
  imports: [
    AboutUsRoutingModule,
    CommonModule,
    SharedModule
  ],
})


export class AboutUsModule { }
