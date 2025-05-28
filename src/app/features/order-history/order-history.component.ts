import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { TrackOrderComponent } from './track-order/track-order.component';
import { OrderHistoryRequestParam } from 'src/app/core/models/order-history.model';
import { OrderHistoryService } from './service/order-history.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Location } from '@angular/common';


@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  orderModalRef: BsModalRef;
  selectedDate: any = '';
  filterForm?: FormGroup;
  selected: any;
  totalOrderCount: number;
  itemsPerPage = 3;
  startItemCount = 1;
  itemsLabelPerPage= 3
  isMultiTenant : boolean= false;
  minDate : any
  maxDate: any;
  page = 1;
  searchOrderValue = new FormControl("");
  get orderClasses(): any {
    return this._orderHistoryService.getOrderClasses();
  }


  orderHistoryRequestParam: OrderHistoryRequestParam = {
    orderType: "",
    fromDate: null,
    toDate: null,
    search: "",
    sort: "DESC",
    take: this.itemsPerPage,
    skip: 0,
  }

  public orderData = []

  constructor(private _hfs: HeaderFooterSidebarSettingService,
    private _modalService: BsModalService,
    private fb: FormBuilder,
    private _orderHistoryService: OrderHistoryService,
    private _toastrService: ToastrService,
    private _authService: AuthService,
    private _location: Location
  ) { }




  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: true, isFooter: true, isSidebar: true });
    let startDate = new Date();    
    startDate.setMonth(startDate.getMonth() - 3);
    this.setMinMaxDateRanges();

    let endDate = new Date()

    this.filterForm = this.fb.group({
      month: ['3'],
      selectDate: [''],

    });
    let configList = this._authService.getUserConfiguration();
    this.isMultiTenant = configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false; 
    this.setDates(startDate, endDate)
    this.getOrderHistory(this.orderHistoryRequestParam);
    this.onSearchOrder()

  }

  setMinMaxDateRanges() {
    this.minDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() - 24)
    this.minDate = this.minDate.toISOString();

    this.maxDate = new Date()
    this.maxDate = this.maxDate.toISOString()
  }

  onSearchOrder() {
    this.searchOrderValue?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(() => {
        this.orderHistoryRequestParam = {
          ...this.orderHistoryRequestParam,
          search: this.searchOrderValue?.value,
        }
        this.getOrderHistory(this.orderHistoryRequestParam)
      })
    ).subscribe(() => {
    })
  }

  onClearSearch() {
    this.searchOrderValue.setValue("")
  }

  setDates(startDate, endDate) {
    this.orderHistoryRequestParam.fromDate = (startDate.getMonth() + 1) + '-' + startDate.getDate() + '-' + startDate.getFullYear(),
    this.orderHistoryRequestParam.toDate = (endDate.getMonth() + 1) + '-' + endDate.getDate() + '-' + endDate.getFullYear()
  }

  getOrderHistory(params) {
    this._orderHistoryService.getOrderHistory(params,this.isMultiTenant).subscribe((orderHistory) => {
      this.orderData = orderHistory.data.orders
      this.totalOrderCount = orderHistory.data.totalCount
      this.manageItemsPerPage()
    })
  }

  manageItemsPerPage() {
    if(this.itemsPerPage > this.totalOrderCount || this.itemsPerPage==1) {
     this.itemsPerPage = this.totalOrderCount;
    }
    this.itemsPerPage = this.itemsPerPage == 0 ? 1 : this.itemsPerPage;
    this.updatePagenationLabels();
  }

  onRedirectToProductPage() {
    this._location.back()
  }

  reOrder() {
    this._toastrService.info('This feature is In Progress.')
  }

  onOptionsSelected(event) {
    this.page = 1;
    this.itemsPerPage = parseInt(event.currentTarget.value)
    this.itemsLabelPerPage = this.itemsPerPage;
    this.orderHistoryRequestParam.take = this.itemsPerPage;
    this.getOrderHistory(this.orderHistoryRequestParam)
  }

  pageChanged(event: PageChangedEvent): void {

    this.page = event.page;
    let param = {
      ...this.orderHistoryRequestParam,
      skip: (this.page - 1) * this.orderHistoryRequestParam.take,
      // page: event.page,
    }    
    this.getOrderHistory(param);
  }

  updatePagenationLabels()
  {
    this.startItemCount = ((this.page - 1) * this.orderHistoryRequestParam.take) > 0 ? (this.page - 1) * this.orderHistoryRequestParam.take  + 1 : 1;
    const limit = (this.page - 1) * this.orderHistoryRequestParam.take + this.orderHistoryRequestParam.take;
    this.itemsLabelPerPage =  limit > this.totalOrderCount ? this.totalOrderCount : limit ; 
  }


  moveToOrder(data: any, action, colors) {
    const initialState: any = {
      backdrop: 'static',
      data: data,
      bgColor: colors?.borderColor,
      headerTextColor: colors?.headerColor,
      action: action,
      modal: true,
      isMultiTenant: this.isMultiTenant
    }

    this.orderModalRef = this._modalService.show(TrackOrderComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered order-modal' });
    return this.orderModalRef;
  }

  filterhistory(month) {
    this.selected = '';
    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(month));

    let endDate = new Date();
    this.setDates(startDate, endDate)
    if (parseInt(month) >= 0) {
      this.filterForm?.patchValue({
        month: month,
        selectDate: '',
      });
    }
    this.getOrderHistory(this.orderHistoryRequestParam)

  }

  changeDate(ev: any): void {
    this.selectedDate = ev;
    if (ev && ev.startDate != null && ev.endDate != null) {
      let startDate: Date = ev.startDate.toDate();
      let endDate: Date = ev.endDate.toDate();

      if (startDate > endDate) {
        endDate = startDate;
      }

      const d1 = new Date(this.maxDate)
      d1.setHours(0,0,0)

      const d2 = endDate
      d2.setHours(0,0,0)

      if(d1.getTime() !== d2.getTime()) {
        endDate.setDate(endDate.getDate() - 1)
      }

      this.setDates(startDate, endDate)
      this.filterForm?.patchValue({
        month: '0',
      });
      this.getOrderHistory(this.orderHistoryRequestParam)
    }
  }
}
