/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';;
import { SharedModule } from 'src/app/shared/shared.module';;
import { OrderSubmissionComponent } from 'src/app/features/shopping-cart/order-submission/order-submission.component';
import { ShoppingCartComponent } from './shopping-cart.component';
import { RequestedItemsComponent } from './requested-items/requested-items.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { ShippingAddressComponent } from 'src/app/features/shopping-cart/shipping-address/shipping-address.component';
import { AddAddressComponent } from './add-address/add-address.component';
import { TdddConfirmationComponent } from './tddd-confirmation/tddd-confirmation.component';
import { DeliveryDayComponent } from './delivery-day/delivery-day.component';
import { SrfDeliveryComponent } from './srf-delivery/srf-delivery.component';

@NgModule({
    declarations: [OrderSubmissionComponent,
        ShoppingCartComponent,
        RequestedItemsComponent,
        TermsAndConditionsComponent,
        ShippingAddressComponent,
        AddAddressComponent,
        TdddConfirmationComponent,
        SrfDeliveryComponent,
        DeliveryDayComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [],
    exports: [ShippingAddressComponent]
})
export class ShoppingCartModule { }