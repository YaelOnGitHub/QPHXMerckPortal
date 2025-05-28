import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageAocComponent } from './manage-aoc/manage-aoc.component';
import { AocRoutingModule } from './aoc-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { TruncatePipe } from './truncate.pipe';



@NgModule({
  declarations: [
    ManageAocComponent,
    TermsAndConditionsComponent,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    AocRoutingModule,
    SharedModule,
    NgxDaterangepickerMd.forRoot(),
    PaginationModule.forRoot()
  ],
  exports: [TruncatePipe]
})
export class AocModule { }
