/* eslint-disable prettier/prettier */
import { Component, forwardRef, Injector, Input, OnInit, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormControlDirective, NgControl, NG_VALUE_ACCESSOR, ControlContainer, FormControl, ValidatorFn, Validators, Validator, AbstractControl, NgModel, FormControlName } from '@angular/forms';
import { BsModalRef } from "ngx-bootstrap/modal";
import { ProductDetails } from "src/app/core/models/product-details.model";
import { cartManagementService } from "../../services/cart-management-service/cart-management-service";

@Component({
  selector: "app-stepper-input",
  templateUrl: "./stepper-input.component.html",
  styleUrls: ["./stepper-input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StepperInputComponent),
      multi: true
    }
  ]
})
export class StepperInputComponent implements ControlValueAccessor, OnInit, Validator {
  validate(control: AbstractControl) {
    return null;
  }
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  @Input() selectedV?: string;
  @Input()
  formControl?: FormControl;
  @Input()
  formControlName?: string;
  public controlDir!: NgControl;
  title = "Stepper input";
  @Input() step: number = 1;
  @Input() min: number = 0;
  @Input() max: number = 0;
  @Input() symbol: string;
  @Input() ariaLabelLess: string;
  @Input() ariaLabelMore: string;
  @Input() isRequired: boolean = false;
  @Input() productItem: ProductDetails;
  @Input() modalRef: any;
  dropdownOptions: any = []
  selectedQnt : number = 0

  renderedValue: number = 0;
  value: number = 0;

  get control() {
    const injectedControl = this.injector.get(NgControl);
    let control;
    switch (injectedControl.constructor) {
      case NgModel: {
        control = injectedControl as NgModel;
        break;
      }
      case FormControlName: {
        control = this.controlContainer?.control?.get(this.formControlName)
        break;
      }
      default: {
        control = (injectedControl as FormControlDirective).form as FormControl;
        break;
      }
    }
    return control;
  }

  constructor(private injector: Injector, private controlContainer: ControlContainer, private _modalRef: BsModalRef, private _cartManagementService: cartManagementService) {
  }

  onChange = (renderedValue) => {

  };

  onTouched = () => { };

  touched = false;

  disabled = false;

  writeValue(renderedValue: number): void {
    if (renderedValue != null) {
      this.renderedValue = renderedValue;
      this.value = renderedValue
    }
  }
  registerOnChange(onChange: any): void {
    this.onChange = onChange;

  }
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  updateChanges() {
    this.onChange(this.value);
}

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }


  ngOnInit() {
    const control = this.control;
    this.prepareDropdownOptions()
  }

  prepareDropdownOptions() {
    this.step = this.step == 0 ? 1 : this.step;
    for(let i = this.min+this.step; i<=this.max; i=i+this.step) {
        this.dropdownOptions.push(i)
    }
    this.selectedQnt = this.productItem?.selectedQuantity !== 0 ? this.productItem.selectedQuantity : this.step
  } 

  onOptionsSelected(event) {
    const val = event?.currentTarget?.value || this.min
    this.value = val
    this.renderedValue = this.value;

    this.onChange(val); 
    const updateWithQuantity = {
      ...this.productItem,
      selectedQuantity: val
    }
    this.selectedQnt = val;
    this._cartManagementService.updateProductInToCart(updateWithQuantity);
  }

  onRemove() {
    this._cartManagementService.deleteSelectedProductItems(this.productItem);
    this._modalRef?.hide()
  }

  toggleMore = () => {
    if (this.step + this.value <= this.max) {
      this.value = this.value + this.step;
      this.renderedValue = this.value;
    }
    this.onChange(this.renderedValue);
    let updateWithQuantity = {
      ...this.productItem,
      selectedQuantity: this.value
    }
    this._cartManagementService.updateProductInToCart(updateWithQuantity);
  };

  toggleLess = () => {
    if (this.value - this.step >= this.min) {
      this.value = this.value - this.step;
      this.renderedValue = this.value;
    }
    this.onChange(this.renderedValue);
    let updateWithQuantity = {
      ...this.productItem,
      selectedQuantity: this.value
    }
    this._cartManagementService.updateProductInToCart(updateWithQuantity);
  };
}
