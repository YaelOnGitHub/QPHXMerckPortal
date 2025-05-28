import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-srf-delivery',
  templateUrl: './srf-delivery.component.html',
  styleUrls: ['./srf-delivery.component.scss'],

  encapsulation: ViewEncapsulation.None
})
export class SrfDeliveryComponent implements OnInit {

  constructor(private bsModalRef: BsModalRef,
    private _fb: FormBuilder, private _cartService: CartService,
    private _entitlement: EntitlementService) {

  } 
  formGroup: FormGroup;
  srfDeliveryViaFax: boolean = false;
  faxNumberPattern = /^\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/;

  ngOnInit(): void {

    this.formGroup = this._fb.group(
      {
        srfDelivery: [''],
        faxNumber: ['',Validators.minLength(10)]
      },
    );

    // this.formGroup = this._fb.group({
    //   srfDelivery: ['', Validators.required], // Required field for srfDelivery
    //   faxNumber: ['', [Validators.minLength(10), Validators.pattern(this.faxNumberPattern)]], // Conditional validators for faxNumber
    // });
  }

  onFaxInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
 
    // Allow only digits and limit to 10 characters
    const newValue = input.value.replace(/[^0-9]/g, ''); // Remove non-digit characters
    if (newValue.length > 10) {
      input.value = newValue.slice(0, 10); // Limit to 10 characters
    } else {
      input.value = newValue; // Update the input value
    }
 
    // Update the form control with the new value
    this.formGroup.get('faxNumber').setValue(input.value);
  }

  onChangeValue(event: any) {

    this.srfDeliveryViaFax = event?.currentTarget?.checked || false;
    this.formGroup.controls['srfDelivery'].setValue(this.srfDeliveryViaFax);
    if (!this.srfDeliveryViaFax) {
      this.formGroup.get('faxNumber').clearValidators()
      this.formGroup.get('faxNumber').updateValueAndValidity()
      this.formGroup.controls['faxNumber'].setValue('');
    } else {

      
      this.formGroup.get('faxNumber').setValidators([
        Validators.required,
        Validators.pattern(this.faxNumberPattern)
      ]);
      this.formGroup.get('faxNumber').updateValueAndValidity();
    }

  }

  closeModal() {
    this.bsModalRef.hide();
  }


  onSaveButton() {
    this.bsModalRef.hide()
    let data = this.formGroup.value
    if (data.faxNumber) {
      data.faxNumber = data.faxNumber.replace(/[\(\)\-\s]/g, '');
    }
    this._cartService.setFax(data)
    this._cartService.srfDeliveryModalSaved.next(data)
  }

}
