/* eslint-disable prettier/prettier */
/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable prettier/prettier */
import { Component, EventEmitter, forwardRef, Injector, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControlDirective, NgControl, NG_VALUE_ACCESSOR, ControlContainer, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { InputTextService } from '../../services/input-text.service';
import { InputTextData, InputTextEventType } from './../../models/input-text-data.model';


@Component({
    selector: 'app-text-input',
    templateUrl: './text-input.component.html',
    styleUrls: ['./text-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInputComponent),
            multi: true
        }
    ]
})

export class TextInputComponent implements ControlValueAccessor, OnInit {

    @Input()
    formControl!: FormControl;
    @Input()
    formControlName!: string;
    @Input() type?: string = 'text';
    @Input() isRequired: boolean = false;
    @Input()
    pattern!: string;
    @Input()
    label!: string;
    @Input() placeholder: string = '';
    @Input()
    errorMsg!: string;
    @Input() disabled: boolean = false;
    @Input() size: string;
    @Input()
    inputLocation!: string;
    @Input() inputTextValue: any;
    @Input() cols: number = 8;
    @Input() rows: number = 4;
    @Input() hint: string = '';
    @Input() formatType?: string;
    @Input() maxlength?: string;
    @Input() inputName?: string
    @Input() isReadOnly: boolean = false;
    @Input() errorMessage: string = "Please make sure to provide information in the required fields.";
    @Input() maxLength: string = '1000';
    @Input() icon?: string = null;
    @Input() isPestText?: boolean = true;
    @Input() isInvalid?: boolean = false;
    @Input() isInputRightIcon?: string = null;
    @Output() change = new EventEmitter<any>()
    @Input() showPrimaryError: boolean = true;

    public autoComplete: string = 'off';
    public controlDir!: NgControl;

    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;

    constructor(private injector: Injector, private _inputTextService: InputTextService) { }

    writeValue(obj: any): void {
        this.formControlDirective?.valueAccessor?.writeValue(obj);
    }
    registerOnChange(fn: any): void {
        this.formControlDirective?.valueAccessor?.registerOnChange(fn);
    }
    registerOnTouched(fn: any): void {
        this.formControlDirective?.valueAccessor?.registerOnTouched(fn);
    }
    get control() {
        return this.formControl || this.controlContainer?.control?.get(this.formControlName);
    }

    get controlContainer() {
        return this.injector.get(ControlContainer);
    }

    onFocus($event: any) {
        let inputTextData: InputTextData = {
            inputLocation: this.inputLocation,
            inputEvent: $event,
            inputTextValue: this.inputTextValue,
            inputTextEventType: InputTextEventType.Focus
        }

        this._inputTextService.inputTextStream.next(inputTextData);
    }

    onBlur($event: any) {
        let inputTextData: InputTextData = {
            inputLocation: this.inputLocation,
            inputEvent: $event,
            inputTextValue: this.inputTextValue,
            inputTextEventType: InputTextEventType.Blur
        }

        this._inputTextService.inputTextStream.next(inputTextData);
    }

    onChangeValue(event: any) {
        this.change.emit(event);
    }

    ngOnInit() {
        let _chrome = navigator.userAgent.indexOf('Chrome') > -1;
        if (_chrome) {
            this.autoComplete = "offoff"; // chrome specific 
        }
        const control = this.control;
        const validators: ValidatorFn[] = control?.validator ? [control?.validator] : [];
        if (this.isRequired) {
            validators.push(Validators.required);
        }
        if (this.pattern) {
            validators.push(Validators.pattern(this.pattern));
        }

        control?.setValidators(validators);
        control?.updateValueAndValidity();
    }
}
