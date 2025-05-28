/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs'
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { SubscriptionProducts } from '../../registration/registration-form.model';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { CancelSubscriptionRequest } from 'src/app/core/models/common.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-subscriptions',
  templateUrl: './manage-subscriptions.component.html',
  styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit {
  subscriptionProductsArray: SubscriptionProducts[];
  manageLicenseSubscription: Subscription;
  cancelSubscription: Subscription;
  constructor(
    public _addLicenseModalRef: BsModalRef,
    private _common: CommonService,
    private _alertService: AlertService,
    private _toster: ToastrService
  ) { }

  ngOnInit(): void {
    this.manageSubscriptions();
  }

  manageSubscriptions() {
    this.manageLicenseSubscription = this._common.getSubscriptions().subscribe(res => {
      if (res) {
        this.subscriptionProductsArray = res['data'].subcriptions;

        this.subscriptionProductsArray  = res['data'].subcriptions.map(product => {
          if (product.productLogo.includes("Verquvo-samples.png")) {
              return {
                  ...product,
                  productLogo: product.productLogo.replace("Verquvo-samples.png", "Verquvo-samples-subscription.png")
              };
          }
          return product;
      });

      }
    }
    );
  }
  
  cancelSubscriptions(subscriptionId: string) {
    let cancelSubscriptionRequest: CancelSubscriptionRequest = { subscriptionId: subscriptionId  };
    this.cancelSubscription = this._common.cancelSubscriptions(cancelSubscriptionRequest).subscribe(res => {
      if (res) {
        this.manageSubscriptions();
      }
    }
    );
  }  
 
  unSubscribe(subscriptionId: string) {
    this._alertService.confirm({ customTitle: 'Automated Request Confirmation', isCustomTitle: true, 
    Heading: 'Are you sure you want to cancel this product from Automated Request?', icon: 'fa-light fas fa-bell fa-2x', SubHeading: '', 
    isRequiredCancelBtn: true, isRequiredOkBtn: true, okBtnText: 'Yes', cancelBtnText: 'No' }).subscribe((result) => {
      if (result) {
        this.cancelSubscriptions(subscriptionId);
        this._toster.success('Sucessfully Cancelled.');
      }
    })
  }

  ngOnDestroy(): void {
    this.manageLicenseSubscription?.unsubscribe();
    this.cancelSubscription?.unsubscribe();
  }

}
