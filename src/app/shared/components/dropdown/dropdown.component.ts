/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable prettier/prettier */
import { Component, OnInit, Input, forwardRef, Injector, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';


interface dropdownInterface {
    dropDownOptions: Array<any>;
    searchable?: Boolean;
    controlDir: NgControl;
    change: EventEmitter<any>;
    formControl: FormControl;
    disabled: Boolean;
    multiSelect?: Boolean;
    header: String;
    placeholder: String;
    isRequired: Boolean;
    formControlName?: string;
    errorMsg: String;
    clearable: Boolean;
    bindLabel?: string;
    bindValue?: string;
    hideSelected?: boolean;
    removeAllBtnWithText?: boolean;
    //multi select dropdown's selected options
    id: string;
    showSelectedItems: boolean;
    maxSelectedItems: number;
    isExtraHeader?: boolean;
    isGroupBy?: boolean;
    groupBy?: string;
    appendTo?: string;
    dropdownOptionModelSelection: Array<any>;
    selectedOptions?: Array<any>;
    templateRefForMultiSelect: TemplateRef<any> | any;
    noFoundText: string;
}

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true
        }
    ]
})

export class DropdownComponent implements ControlValueAccessor, OnInit, dropdownInterface {
    @Input() dropDownOptions: Array<any>;
    @Input() searchable = false;
    @Input() disabled = false;
    @Input() header: String;
    @Input() placeholder: String;
    @Input() isRequired: Boolean;
    @Input() errorMsg: String;
    @Input() clearable = false;
    @Input() icon?: string = null;
    sortType?: any;
    public controlDir: NgControl;
    constructor(private injector: Injector, private config: NgSelectConfig) {
        this.dropDownOptions = [];
        this.header = '';
        this.placeholder = '';
        this.isRequired = false;
        this.errorMsg = '';
        this.controlDir = null as any
    }

    @Input()
    formControl: FormControl = null as any;
    @ViewChild(FormControlDirective, { static: true })
    formControlDirective: FormControlDirective | any;
    @ViewChild(NgSelectComponent) ngSelect: NgSelectComponent | any;
    @Output() change = new EventEmitter<any>();
    @Input() multiSelect = false;
    @Input()
    formControlName?: string;

    @Input() bindLabel?: string;
    @Input() bindValue?: string;
    @Input() hideSelected?: boolean = false;
    @Input() removeAllBtnWithText?: boolean = false;
    @Input() sortbyBindLabel?: boolean = false;
    //multi select dropdown's selected options
    @Input() id: string = '';
    @Input() showSelectedItems: boolean = false;
    @Input() maxSelectedItems: number = 100;
    @Input() isExtraHeader?: boolean = false

    @Input() isGroupBy = false;
    @Input() groupBy = '';
    @Input() appendTo = '';

    @ViewChild('selectedItemTemaplate', { static: true }) selectedItemTemaplate: TemplateRef<any> | undefined;
    dropdownOptionModelSelection: Array<any> = [];
    selectedOptions?: Array<any>;
    @Input() templateRefForMultiSelect: TemplateRef<any> | any;
    @Input() noFoundText = "No items found";

    ngOnInit() {
        if (this.showSelectedItems && this.multiSelect) {
            this.templateRefForMultiSelect['template'] = this.selectedItemTemaplate;
        }
        this.onSortDropDownOptions();
    }

    get control() {
        return this.formControl || this.controlContainer.control?.get(this.formControlName ? this.formControlName : '');
    }

    get controlContainer() {
        return this.injector.get(ControlContainer);
    }

    registerOnTouched(fn: any): void {
        this.formControlDirective?.valueAccessor?.registerOnTouched(fn);
    }

    registerOnChange(fn: any): void {
        this.formControlDirective?.valueAccessor?.registerOnChange(fn);
    }

    writeValue(value: any): void {
        if (value == null || (value !== 0 && value == '') || (Array.isArray(value) && value.length == 0)) {
            this.selectedOptions = [];
            this.dropdownOptionModelSelection = [];
        } else {
            //remove option
            if (this.bindValue && Array.isArray(value)) {
                this.selectedOptions = this.dropDownOptions?.filter(item => { return value.indexOf(item[this.bindValue ? this.bindValue : '']) > -1 })
                this.dropdownOptionModelSelection = this.selectedOptions ? this.selectedOptions.map(item => item[this.bindValue ? this.bindValue : '']) : []
            } else if (this.bindValue && !Array.isArray(value)) {
                this.selectedOptions = value;
                this.dropdownOptionModelSelection = value;
            } else {
                this.selectedOptions = [...value];
                this.dropdownOptionModelSelection = [...value];
            }
        }
    }

    setDisabledState(isDisabled: boolean): void {
        this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
    }

    setSelection(value: any) {
        this.selectedOptions = value;
        // if (this.change.length) {
            this.change.emit(value);
        // }
    }

    removeSelection(removeItem: any) {
        if (this.bindValue) {
            this.selectedOptions = this.selectedOptions?.filter((item) => item[this.bindValue ? this.bindValue : ''] != removeItem[this.bindValue ? this.bindValue : '']);
            this.dropdownOptionModelSelection = this.dropdownOptionModelSelection.filter((item) => item != removeItem[this.bindValue ? this.bindValue : '']);
        } else {
            this.selectedOptions = this.selectedOptions?.filter((item) => item != removeItem);
            this.dropdownOptionModelSelection = this.dropdownOptionModelSelection.filter((item) => item != removeItem);
        }

        setTimeout(() => {
            this.control?.updateValueAndValidity({ onlySelf: true });
        }, 0);
        // here we can emit the changes as we are doing in setSelection If needed, in future
    }

    removeAllSelection() {
        this.selectedOptions = [];
        this.dropdownOptionModelSelection = [];
        setTimeout(() => {
            this.control?.updateValueAndValidity({ onlySelf: true });
        }, 0);
    }


    onSortDropDownOptions() {
        if (!this.isGroupBy) 
        {
          this.sortType=this.bindValue; 
          if(this.sortbyBindLabel)
          {
            this.sortType=this.bindLabel;
          }
            let dropdownAscSorted = this.dropDownOptions?.sort((a, b) => {
                 if (a[this.sortType] < b[this.sortType]){return -1;}
                  if (a[this.sortType] > b[this.sortType]) { return 1;} 
                  return 0;});
                  this.dropDownOptions = [];
                 this.dropDownOptions = dropdownAscSorted;

        }
    }
}


