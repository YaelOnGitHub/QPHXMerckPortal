/* eslint-disable prettier/prettier */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/directive-selector */
/* eslint-disable prettier/prettier */
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AbstractControl, NgControl, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';

@Directive({
    selector: '[contactNumberFormat]',
    host: {
        '(ngModelChange)': 'onInputChange($event)',
        '(keydown.backspace)': 'onInputChange($event.target.value, true)'
    }
})

export class PhoneDirective {

    constructor(public model: NgControl, private el: ElementRef, private _formGroup: FormGroupDirective) { }

    @Input() formatType: string;
    @Input() required: boolean = false;
    @Input() inputName: string;

    ngOnInit() {
        if (this.formatType === 'mobile' && this.el.nativeElement.value) {

            let tempNumber = this.el.nativeElement.value;
            let formattedNumber = '';
            formattedNumber = `${tempNumber.slice(0, 3)}-${tempNumber.slice(3, 6)}-${tempNumber.slice(6)}`;
            this.el.nativeElement.value = formattedNumber;
        }

    }

    onInputChange(event, backspace) {
        if (!event || event === null || this.formatType === null || this.formatType === "") {
            return;
        }


        if (this.formatType == 'mobile') {

            if (this.el.nativeElement.value.length > 12) {
                event = event.substring(0, 12);
                this._formGroup.control?.get(this.inputName)?.clearValidators();
                this._formGroup.control?.get(this.inputName)?.markAsTouched();
                this._formGroup.control.updateValueAndValidity();
            }



            if (this.el.nativeElement.value.length <= 12) {
                // Access the FormControl
                if (this.inputName) {

                    if (this.required) {
                        this._formGroup.control?.get(this.inputName)?.setValidators([Validators.required, Validators.minLength(12)])
                    } else {
                        this._formGroup.control?.get(this.inputName)?.setValidators([Validators.minLength(12)])
                    }

                    this._formGroup.control?.get(this.inputName)?.markAsDirty();
                    this._formGroup.control?.get(this.inputName)?.markAsTouched();
                    this._formGroup.control?.get(this.inputName)?.updateValueAndValidity();
                }
            }

            if (this.el.nativeElement.value.length) {
                if (!event.match(/(0*[1-9]+0*)+/)) {
                    this._formGroup.control?.get(this.inputName)?.setValidators([Validators.pattern(/(0*[1-9]+0*)+/)])

                    this._formGroup.control?.get(this.inputName)?.markAsDirty();
                    this._formGroup.control?.get(this.inputName)?.markAsTouched();
                    this._formGroup.control?.get(this.inputName)?.updateValueAndValidity();
                };
            }
        }

        var newVal = event.replace(/\D/g, '');

        if (this.formatType == 'mobile') {
            if (newVal.length == 0) {
                newVal = '';
                if (this.required) {
                    this._formGroup.control?.get(this.inputName)?.clearValidators();
                    this._formGroup.control?.get(this.inputName)?.reset();
                    
                    this._formGroup.control?.get(this.inputName)?.setValidators([Validators.required, Validators.minLength(14)])
 
                    this._formGroup.control?.get(this.inputName)?.markAsDirty();
                    this._formGroup.control?.get(this.inputName)?.markAsTouched();
                    this._formGroup.control?.get(this.inputName)?.updateValueAndValidity();
                } else {
                    this._formGroup.control?.get(this.inputName)?.clearValidators();
                    this._formGroup.control?.get(this.inputName)?.reset();
                    this._formGroup.control.updateValueAndValidity();
                }
            }
            else if (newVal.length <= 3) {
                if (backspace) {
                    newVal = newVal.substring(0, newVal.length - 1);
                }
                newVal = newVal.replace(/^(\d{0,3})/, '$1');
            } else if (newVal.length <= 6) {
                newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '$1-$2');
            } else {
                newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '$1-$2-$3');
            }
        }

        if (this.formatType == 'zip') {
            if (newVal.length == 0) {
                newVal = '';
            }
            newVal = newVal.replace(/^(\d{0,5})/, '$1');
        }

        // set the new value
        this.model.valueAccessor.writeValue(newVal);
    }


}