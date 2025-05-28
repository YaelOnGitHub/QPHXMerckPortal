/* eslint-disable prettier/prettier */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatePINRequest } from 'src/app/core/models/security.model';
import { UserSession } from 'src/app/core/models/user-session.model';
import { Constants } from 'src/app/core/utilities/constants';
import { CustomValidators } from 'src/app/core/utilities/custom-validators';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { ManageSecurityService } from './../service/manage-security.service';

@Component({
    selector: 'app-create-pin',
    templateUrl: './create-pin.component.html',
    styleUrls: ['./create-pin.component.scss']
})

export class CreatePinComponent implements OnInit, OnDestroy {

    formGroup: FormGroup;
    headerData = '<h1>Create PIN</h1><p>In order to request Samples and Savings Offers you need to create a PIN that will serve as an electronic signature for your order.</p>';
    addPinSubscription: Subscription;
    hint: string = '';
    disable: boolean = true;
    isChecked: boolean = false;
    submitSuccess: boolean = false;
    showPassword: boolean;
    createPin: boolean;
    constructor(private _fb: FormBuilder, private _authService: AuthService, private _manageSecurityService: ManageSecurityService,
       private _router: Router, private toastr: ToastrService, private _commonService: CommonService) {
        const userSession: UserSession = this._authService.getUserSession();
        if (userSession.userAccount['displaySetPinScreen'] == 'Y') {
            // this._router.navigateByUrl('/security/set-password');
        } else {
          this._commonService.redirectActivatedRoute()
        }
    }

    ngOnInit() {

        this.formGroup = this._fb.group({
            NewPin: ['', [Validators.required, Validators.minLength(4), Validators.pattern(Constants.onlyNumber)]],
            ConfirmPin: ['', [Validators.required, Validators.minLength(4), Validators.pattern(Constants.onlyNumber)]],
            acceptTermsAndConditions: [null, Validators.required],
        }, { validators: CustomValidators.pinMatchValidator });
    }

    onNewPinChanged() {
        let value = this.formGroup.controls['NewPin'].value;
        let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
        let numbers = value.replace(onlyNumberRegExp, '');
        this.formGroup.patchValue({
            NewPin: numbers,
        });
    }

    onConfirmPinChanged() {
        let value = this.formGroup.controls['ConfirmPin'].value;
        let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
        let numbers = value.replace(onlyNumberRegExp, '');
        this.formGroup.patchValue({
            ConfirmPin: numbers,
        });
    }

    onSubmit() {
        this.submitSuccess = true;
        let params: CreatePINRequest = {
            ...this.formGroup.value
        };
        this.addPinSubscription = this._manageSecurityService.createPin(params).subscribe(createPINResponse => {
            if (createPINResponse.success) {
                this.toastr.success(createPINResponse.message);
                this._authService.getAccountDetails().subscribe((item) => {
                  this._commonService.redirectActivatedRoute()
                });
            } else {
                this.toastr.success(createPINResponse.message);
            }
        });
    }

    ngAfterViewInit() {
        this.formGroup.valueChanges.subscribe(x => {
            this.checkValue();
        })
    }

    onCheckChange(e) {
        this.formGroup.patchValue({
            acceptTermsAndConditions: e.target.checked
        });
        this.formGroup.updateValueAndValidity();
    }

    checkValue() {
        if (this.formGroup.valid && this.isChecked) {
            this.disable = false;
        }
        else {
            this.disable = true;
        }
    }

    navigate() {
        this._router.navigateByUrl('/security/set-questions');
    }

    ngOnDestroy() {
        this.addPinSubscription?.unsubscribe();
    }
}