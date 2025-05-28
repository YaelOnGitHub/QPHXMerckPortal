import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, map, Subscription, take } from 'rxjs';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { TrackOrderComponent } from '../../order-history/track-order/track-order.component';
import { Location } from '@angular/common';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { OrderPlaceVerificationType } from 'src/app/shared/enums/order-place-verification-type';
import { Constants } from 'src/app/core/utilities/constants';
import { AocService } from '../aoc.service';
import { CloseAocProductInfo, CloseAocRequest } from 'src/app/core/models/close-aoc.model';
import { AocDetailsRequestParams } from 'src/app/core/models/aoc-details.model';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { Router } from '@angular/router';
import { ManageSecurityQuestionModalComponent } from 'src/app/shared/components/manage-security-question-modal/manage-security-question-modal.component';

@Component({
  selector: 'app-manage-aoc',
  templateUrl: './manage-aoc.component.html',
  styleUrls: ['./manage-aoc.component.scss']
})
export class ManageAocComponent {

  aocModalRef: BsModalRef;
  selectedDate: any = '';
  filterForm?: FormGroup;
  selected: any;
  totalAocCount: number;
  itemsPerPage = 3;
  startItemCount = 1;
  itemsLabelPerPage= 3
  isMultiTenant : boolean= false;
  minDate : any
  maxDate: any;
  page = 1;
  searchAocValue = new FormControl("");
  formGroup: FormGroup<{ createPin: FormControl<string>; password: FormControl<string>; }>;
  IS_PASSWORD_AUTHENTICATION: number;
  forgotPinSubscription: Subscription;
  requestedProductList: any = [];
  get orderClasses(): any {
     return this._aocService.getAocClasses();
  }

  expandedIndex: number | null = null;  // Track the currently expanded item
  PREFERRED_VERIFICATION_METHOD: number;
  IS_PIN_AUTHENTICATION = OrderPlaceVerificationType.PIN;
  tncSub: Subscription;
  isTermAndConditionValid: Boolean = false;

  toggleExpand(index: number) {
    // Toggle the expanded index
    this.expandedIndex = this.expandedIndex === index ? null : index;

    // If expanding, collect products
    if (this.expandedIndex === index) {
        this.collectProducts(index);
    } else {
        // Optionally clear the requestedProductList on collapse
        this.requestedProductList = [];
    }
}

  collectProducts(index: number) {
    const expandedData = this.aocData[index]; // Get the data for the currently expanded index
    if (expandedData && expandedData.products) {
        this.requestedProductList = expandedData.products.map(product => ({
          productId: product.mstrProdClientId,
          productName: product.productName
        }));
    }
}

  aocDetailsRequestParam: AocDetailsRequestParams = {
    orderType: "",
    fromDate: null,
    toDate: null,
    search: "",
    sort: "DESC",
    take: this.itemsPerPage,
    skip: 0,
  }

  public aocData = []

  constructor(private _hfs: HeaderFooterSidebarSettingService,
    private _modalService: BsModalService,
    private fb: FormBuilder,
    private _toastrService: ToastrService,
    private _authService: AuthService,
    private _entitlement: EntitlementService,
    private _fb: FormBuilder,
    private _aocService: AocService,
    private _router: Router,
    public _manageSecurityQuestion: BsModalRef,
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
    this.PREFERRED_VERIFICATION_METHOD =
    parseInt(this._entitlement.hasEntitlementMatchForOrderPlace('PREFERRED_VERIFICATION_METHOD'));

    let configList = this._authService.getUserConfiguration();
    this.isMultiTenant = configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false; 
    this.setDates(startDate, endDate)
    this.getAocDetails(this.aocDetailsRequestParam);
    this.onSearchAoc();

    this.formGroup = this._fb.group({
      createPin: [
        '',
        [Validators.minLength(4), Validators.maxLength(4)],
      ],
      password: ['']
    });


    if (this.PREFERRED_VERIFICATION_METHOD === this.IS_PIN_AUTHENTICATION) {
      this.formGroup.get('createPin').setValidators([Validators.required]);
      this.formGroup.get('password').clearValidators();
    } else if (this.PREFERRED_VERIFICATION_METHOD === this.IS_PASSWORD_AUTHENTICATION) {
      this.formGroup.get('password').setValidators([Validators.required]);
      this.formGroup.get('createPin').clearValidators();
    } else {

    }

    this.tncSub = this._aocService.cartTermsAndConditionsValidStream$.subscribe(
      isTermAndConditionValid => {
        this.isTermAndConditionValid = isTermAndConditionValid;
      }
    );
    this.markLogin();
  }

  checkPinPattern(formControlName){
    let value = this.formGroup.controls[formControlName].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      createPin: numbers,
    });
  }

  setMinMaxDateRanges() {
    this.minDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() - 24)
    this.minDate = this.minDate.toISOString();

    this.maxDate = new Date()
    this.maxDate = this.maxDate.toISOString()
  }

  onSearchAoc() {
    this.searchAocValue?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(() => {
        this.aocDetailsRequestParam = {
          ...this.aocDetailsRequestParam,
          search: this.searchAocValue?.value,
        }
        this.getAocDetails(this.aocDetailsRequestParam)
      })
    ).subscribe(() => {
    })
  }

  onClearSearch() {
    this.searchAocValue.setValue("")
  }

  setDates(startDate, endDate) {
    this.aocDetailsRequestParam.fromDate = (startDate.getMonth() + 1) + '-' + startDate.getDate() + '-' + startDate.getFullYear(),
    this.aocDetailsRequestParam.toDate = (endDate.getMonth() + 1) + '-' + endDate.getDate() + '-' + endDate.getFullYear()
  }

  increaseQuantity(product) {
    // Only increase if receivedQuantity is less than shippedQuantity
    if (product.receivedQuantity < product.shippedQuantity) {
      product.receivedQuantity++;
    }
  }
  
  decreaseQuantity(product) {
    // Only decrease if receivedQuantity is greater than 0
    if (product.receivedQuantity > 0) {
      product.receivedQuantity--;
    }
  }
  

  getAocDetails(params) {
    this._aocService.getAocDetails(params, this.isMultiTenant).subscribe(
        (aocdetails) => {
            console.log('API Response:', aocdetails);
            if (aocdetails && aocdetails.data) {
                this.aocData = aocdetails.data.aocDetails || []; // Default to an empty array if undefined
                console.log("aoc", this.aocData);

                const hasBlockerAoc = this.aocData.some(aoc => aoc.isBlockerAoc === true);

                sessionStorage.removeItem('hasBlockerAoc');
                sessionStorage.setItem('hasBlockerAoc', JSON.stringify(hasBlockerAoc));

                // Initialize receivedQuantity
                this.aocData.forEach(data => {
                    data.products.forEach(product => {
                        product.receivedQuantity = product.shippedQuantity; // Initialize to shipped quantity
                    });
                });

                this.totalAocCount = aocdetails.data.totalCount || 0; // Default to 0 if undefined
                this.manageItemsPerPage();
            } else {
                console.error('Unexpected response structure:', aocdetails);
            }
        },
        (error) => {
            console.error('Error fetching AOC details:', error);
        }
    );
}

  manageItemsPerPage() {
    if(this.itemsPerPage > this.totalAocCount || this.itemsPerPage==1) {
     this.itemsPerPage = this.totalAocCount;
    }
    this.itemsPerPage = this.itemsPerPage == 0 ? 1 : this.itemsPerPage;
    this.updatePagenationLabels();
  }

  onRedirectToProductPage(): void {
    // Retrieve 'hasBlockerAoc' from sessionStorage
    let storedData = sessionStorage.getItem('hasBlockerAoc');
    
    // Parse it or default to false if it's not found
    storedData = storedData ? JSON.parse(storedData) : false;
    
    // Check the blocker AOC status
    if (storedData) {
      // If the user has a blocker, show the error toast
      this._toastrService.error('There are additional shipments that require acknowledgement.');
    } else {
      // If no blocker, navigate to the brands page
      this._router.navigate(['/brands']);
    }
  }

  reOrder() {
    this._toastrService.info('This feature is In Progress.')
  }

  onOptionsSelected(event) {
    this.page = 1;
    this.itemsPerPage = parseInt(event.currentTarget.value)
    this.itemsLabelPerPage = this.itemsPerPage;
    this.aocDetailsRequestParam.take = this.itemsPerPage;
    this.getAocDetails(this.aocDetailsRequestParam)
  }

  pageChanged(event: PageChangedEvent): void {

    this.page = event.page;
    let param = {
      ...this.aocDetailsRequestParam,
      skip: (this.page - 1) * this.aocDetailsRequestParam.take,
      // page: event.page,
    }    
    this.getAocDetails(param);
  }

  updatePagenationLabels()
  {
    this.startItemCount = ((this.page - 1) * this.aocDetailsRequestParam.take) > 0 ? (this.page - 1) * this.aocDetailsRequestParam.take  + 1 : 1;
    const limit = (this.page - 1) * this.aocDetailsRequestParam.take + this.aocDetailsRequestParam.take;
    this.itemsLabelPerPage =  limit > this.totalAocCount ? this.totalAocCount : limit ; 
  }


  moveToAoc(data: any, action, colors) {
    const initialState: any = {
      backdrop: 'static',
      data: data,
      bgColor: colors?.borderColor,
      headerTextColor: colors?.headerColor,
      action: action,
      modal: true,
      isMultiTenant: this.isMultiTenant
    }

    this.aocModalRef = this._modalService.show(TrackOrderComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered order-modal' });
    return this.aocModalRef;
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
    this.getAocDetails(this.aocDetailsRequestParam)

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
      this.getAocDetails(this.aocDetailsRequestParam)
    }
  }

 

  onSubmit(selectedAoc: any) {
    const receivedQuantities: CloseAocProductInfo[] = [];

    // Assuming selectedAoc corresponds to the currently selected AOC data
    const products = selectedAoc.products; // Get products from the selected AOC

    products.forEach((product) => {
        receivedQuantities.push({
            MstrProdClientId: product.mstrProdClientId,
            ProductName: product.productName || '',
            LotNumber: product.productLotNumber || '',
            ExpirationDate: product.productLotExpiration || '',
            ShippedQuantity: product.shippedQuantity || 0,
            ReceivedQuantity: product.receivedQuantity || 0, // Should now get the updated value
            PackingSlipNumber: product.packingSlipNumber,
            ShipmentGuid: product.shipmentGuid
        });
    });

    const request: CloseAocRequest = {
        Pin: this.PREFERRED_VERIFICATION_METHOD === this.IS_PIN_AUTHENTICATION 
            ? Number(this.formGroup.get('createPin')?.value) || 0
            : 0,
        Password: 'yourPassword',
        StateLicenseNumber: selectedAoc.licenseNumber,
        StateLicense: selectedAoc.licenseState,
        LastName: selectedAoc.lastName,
        FirstName: selectedAoc.firstName,
        MiddleName: selectedAoc.middleName,
        ProfDesig: selectedAoc.profDesig,
        Speciality: selectedAoc.speciality,
        Address1: selectedAoc.shippedAddress1 || '',
        Address2: selectedAoc.shippedAddress2 || '',
        City: selectedAoc.shippedCity || '',
        State: selectedAoc.shippedState,
        Zip: selectedAoc.shippedZip || '',
        ReqstTransId: selectedAoc.requestTransactionId,
        ShipmentTrackingNum: selectedAoc.shipmentTrackingNumber,
        XtrnlPractId: selectedAoc.externalClientPractId,
        XtrnlPractLocid: selectedAoc.externalClientPractLocId,
        LogonCreateBy: selectedAoc.logonCreateBy,
        Products: receivedQuantities // This will now only include the selected products
    };

    this._aocService.closeAoc(request).subscribe({
        next: _closeAocResponse => {
            if (_closeAocResponse.success && _closeAocResponse.data?.isAocClosed) {
                this._toastrService.success('Aoc closure request has been submitted successfully.');
                setTimeout(() => {
                  location.replace(location.href + '?t=' + new Date().getTime());
                }, 5000);
            } else {
                this._toastrService.error('There is an error while submitting request');
            }
        },
        error: error => {
            if (error.apiMessageCode !== "BAD_REQUEST_INVALID_TDDD") {
                return;
            }
        }
    });
}


  forgotPin() {
    let initialState = {
      data: ''
    }
    this._manageSecurityQuestion = this._modalService.show(ManageSecurityQuestionModalComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered' })
    this.forgotPinSubscription = this._modalService.onHide.pipe(take(1)).subscribe(res => {
      if (this._manageSecurityQuestion?.content?.success) {
        this._router.navigate(['security/create-pin']);
      }
    })
  }

  markLogin(): void {
    localStorage.setItem('firstBrandsLogin', 'true');
  }

  ngOnDestroy() {

    this.tncSub?.unsubscribe();
    this.forgotPinSubscription?.unsubscribe();
  }
}
