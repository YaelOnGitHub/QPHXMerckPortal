import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { OrderHistoryService } from '../service/order-history.service';


@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss']
})
export class TrackOrderComponent implements OnInit {

  get orderClasses(): any {
    return this._orderHistoryService.getOrderClasses();
  }
  anchorTemplate = "<a href='##trackingurl##' target='_blank'>##trackingnumber##</a>";

  data: any
  action: any
  bgColor: string
  headerTextColor: string
  isMultiTenant: boolean
  orderDetails: any;
  constructor(public activeModal: BsModalRef,
    public _orderHistoryService: OrderHistoryService
  ) { }

  ngOnInit(): void {
    const path = this.action == 'viewOrder' ? 'GetOrderDetails' : 'GetOrderTrackingDetails';
    this._orderHistoryService.getOrderDetails(this.data, path,this.isMultiTenant).subscribe((response: any) => {
      this.orderDetails = response.data;
    })
  }

  getTrackingLink(td: any): any {
    let trackingNumber = this.anchorTemplate;
    if (td.trackingNumber)
      trackingNumber = trackingNumber.replace("##trackingnumber##", td.trackingNumber);
      else
      trackingNumber= trackingNumber.replace("##trackingnumber##", '');
      
    if (!td.trackingUrl || td.trackingUrl.trim() === "")
      trackingNumber = trackingNumber.replace(" href='##trackingurl##' target='_blank'", "")
    else
      trackingNumber = trackingNumber.replace("##trackingurl##", td.trackingUrl)

    return trackingNumber;
  }

  expandView(event) {
    if (!event) return;
    const elem = event.target.nextElementSibling;
    if (elem.style.display === 'block') {
      elem.style.display = 'none'
      event.srcElement.classList.remove('rotate-icon')
      return
    }
    elem.style.display = 'block'
    event.srcElement.classList.add('rotate-icon')
  }

  onCloseModal() {
    this.activeModal.hide();
  }
}
