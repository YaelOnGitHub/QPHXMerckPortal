import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-tddd-confirmation',
  templateUrl: './tddd-confirmation.component.html',
  styleUrls: ['./tddd-confirmation.component.scss'],

  encapsulation: ViewEncapsulation.None
})
export class TdddConfirmationComponent implements OnInit {

  constructor(private bsModalRef: BsModalRef, private _fb: FormBuilder, private _cartService: CartService,
    private _entitlement: EntitlementService) {
    this.getTDDDConfig()
  } 
  formGroup: FormGroup;
  tddExempt: boolean = false;
  tdddExemptReasonList;
  tdddNonExemptProductList
  isCeritfyChecked: boolean = false;
  tdddExemptDisable: boolean;
  productList: any;

  ngOnInit(): void {
    this.getTDDDNumber()
    this.checkTDDDExemptStatus()
    this.formGroup = this._fb.group(
      {
        tddExemption: [''],
        tdddNumber: ['',Validators.minLength(9)],
        tdddExemptReason: [''],
        tdddVerification: [null, Validators.required]
      },
    );
    this._cartService.tdddExempt$.subscribe((res) => this.onToggleClicked(res))
  }

  getTDDDConfig() {
    this.tdddExemptReasonList = JSON.parse(this._entitlement.keyValueJSON('TDD_REASON_CODE'))['TdddReasons'] || [];
    this.tdddNonExemptProductList = JSON.parse(this._entitlement.keyValueJSON('TDDD_NONEXEMPTION_PRODUCT_TYPES'))['ProductTypes'] || [];
  }

  getTDDDNumber() {
    const locId = this._cartService.getSelectedAddress();
    this._cartService.getTDDDNumber(locId).subscribe((res) => {
      const tddd = res?.data?.tdddId || '';
      this.formGroup.patchValue({
        tdddNumber: tddd
      })
    })
  }

  closeModal() {
    this.bsModalRef.hide();
  }


  checkTDDDExemptStatus() {
    const result = this.productList.some(product =>
      this.tdddNonExemptProductList.includes(product.productType.toString())
    )
    this.tdddExemptDisable = result
  }

  onTDDDVerification(event) {
    this.isCeritfyChecked = event?.currentTarget.checked || false
  }

  onSaveButton() {
    this.bsModalRef.hide()
    const reasonDescription =  this.tdddExemptReasonList.filter(x=> x.ReasonCode == this.formGroup.value.tdddExemptReason)[0]?.ReasonDescription
    let data = this.formGroup.value
    data.tdddExemptReasonDescription = reasonDescription
    this._cartService.tddModalSaved.next(data)
  }

  onToggleClicked(event: any) {
    this.tddExempt = event?.currentTarget?.checked || false;
    this.formGroup.controls['tddExemption'].setValue(this.tddExempt);
    if (this.tddExempt) {
      this.formGroup.get('tdddExemptReason').setValidators(Validators.required)
      this.formGroup.get('tdddNumber').clearValidators()
      this.formGroup.get('tdddNumber').updateValueAndValidity()
    } else {
      this.formGroup.get('tdddExemptReason').clearValidators()
      this.formGroup.get('tdddExemptReason').updateValueAndValidity()
      this.formGroup.get('tdddNumber').setValidators([Validators.required,Validators.minLength(9)])
    }

  }
}
