import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderHistoryComponent } from './order-history.component';
import { OrderHistoryRoutingModule } from './order-history-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { TrackOrderComponent } from './track-order/track-order.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';


@NgModule({
  declarations: [
    OrderHistoryComponent,
    TrackOrderComponent,
  ],
  imports: [
    CommonModule,
    OrderHistoryRoutingModule,
    SharedModule,
    NgxDaterangepickerMd.forRoot(),
    PaginationModule.forRoot()

  ]
})
export class OrderHistoryModule { }
