/* eslint-disable prettier/prettier */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CartService } from '../service/cart.service';


@Component({
  selector: 'app-order-submission',
  templateUrl: './order-submission.component.html',
  styleUrls: ['./order-submission.component.scss']
})
export class OrderSubmissionComponent implements OnInit {
  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;
  formGroup: FormGroup;
  @Input() totalItem: number;
  isTermAndConditionValid: Boolean = false;
  isAtLeastOneProductItemValid: Boolean = false;
  constructor(private _fb: FormBuilder, private _router: Router, private _CartService: CartService) { }

  ngOnInit() {
    this.formGroup = this._fb.group({
      createPin: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._CartService.cartTermsAndConditionsValidStream$.subscribe((isTermAndConditionValid) => {
      this.isTermAndConditionValid = isTermAndConditionValid;
    });

    this._CartService.cartAtLeastOneProductItemValidStream$.subscribe((isAtLeastOneProductItemValid) => {
      this.isAtLeastOneProductItemValid = isAtLeastOneProductItemValid;
    });

  }

  onSubmit() {
    
  }

  onRedirectToProductPage() {
    this._router.navigateByUrl('products');
  }
}