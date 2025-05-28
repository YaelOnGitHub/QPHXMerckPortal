import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { SrfLinkService } from '../srf-link.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';

@Component({
  selector: 'app-srf-link-confirmation',
  templateUrl: './srf-link-confirmation.component.html',
  styleUrls: ['./srf-link-confirmation.component.scss']
})
export class SrfLinkConfirmationComponent implements OnInit {

  verificationCode: string = '';

  constructor(private _hfs: HeaderFooterSidebarSettingService,
    private _srfService: SrfLinkService,
    private _router: Router,
    private _sessionService: SessionService,
    private _commonService: CommonService,
    private _route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private _cartManagementService: cartManagementService, private _alertService: AlertService) {

      this._route.queryParams.subscribe((param) => {
        this.verificationCode = param['verificationCode'] || '' 
      })
  }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: true, isFooter: true, isSidebar: true });

    if (this.verificationCode !== 'undefined' && this.verificationCode !== '') {
      this.verifySRFLink()
      return
    }
    this.fetchSRFProducts()
  }

  verifySRFLink() {
    const params = {
      verificationCode: decodeURIComponent(this.verificationCode),
    }
    this._srfService.verifySRFLink(params).subscribe((res) => {
        if(res.success) {
          if(res.data.isValid) {
            this.showConfirmationPopup(res.data.srfId)
          } else {
            this.showErrorPopup(res?.message) 
          }
        }
    })
  }

  showErrorPopup(msg) {
    this._alertService.error({ Heading: msg, SubHeading: '', icon: 'fa-sharp fa-solid fa-circle-exclamation' }).subscribe((res) => {
      this._router.navigateByUrl('request');
    })
  }


  showConfirmationPopup(id) {
    this._srfService.openSRFModal({ customTitle: 'Automated Request Notification', isCustomTitle: true, SubHeading: '', icon: 'fa-regular fa-4x fa-light fa-file-text fa-2x', Heading: 'You have enrolled in Automated Request, and the additional samples are now available. To review and submit your request, select Continue. If necessary, you could include additional products or make modifications to the selection before submitting the request.', okBtnText: 'Continue', cancelBtnRequired:false ,cancelBtnText: 'Cancel' }).subscribe((result) => {    
      if(result) {
        this.fetchSRFProducts(id);
        return;
      } 
      this._router.navigateByUrl('request')
    })

  }

  fetchSRFProducts(id = null) {
    const params = {
      SRFId: id
    }
    this._srfService.fetchSRFProducts(params).subscribe((res) => {
      if (res.success) {
        if(res?.data?.srfProducts.length == 0) {
          this._alertService.confirm({ customTitle: 'No products available',extraText : 'There is no product available for this Automated Request', textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: false, isRequiredOkBtn: true, okBtnText: 'Ok' }).subscribe((res) => {
            this._commonService.redirectActivatedRoute();
          });
          return;
        }
        this.populateProductsToCart(res?.data?.srfProducts)
        this.setSelectedAddress(res?.data?.addressId);
      }
    })
  }

  setSelectedAddress(addressId) {
    this._sessionService.setItem('SRFAddressId',addressId)
  }

  populateProductsToCart(products) {
    let isUpdate = false;
    let updateWithQuantity = {}
    products.forEach((prod) => {
      isUpdate = false;

      updateWithQuantity = {
        ...prod,
        subscriptionRequired: true,
        isSubscribed: true,
        isSubscribeable: true,
        isProductSelected: true,
      }

      this._cartManagementService.getCurretnProductValue().forEach((item) => {
        if (item.id?.includes(prod.id)) {
          isUpdate = true;
        }
      });

      if (isUpdate) {
        this._cartManagementService.updateProductInToCart(updateWithQuantity);
      } else {
        this._cartManagementService.addProductInToCart(updateWithQuantity);
      }
      this._router.navigateByUrl('request')
    });

  }
}
