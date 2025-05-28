import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription, take } from 'rxjs';
import { ManageSecurityService } from '../../manage-security/service/manage-security.service';
import { ManageSecurityQuestionModalComponent } from '../../../shared/components/manage-security-question-modal/manage-security-question-modal.component';
import { Router } from '@angular/router';
import { API_Response } from 'src/app/core/models/common.model';
import { Constants } from 'src/app/core/utilities/constants';

@Component({
  selector: 'app-manage-change-pin',
  templateUrl: './manage-change-pin.component.html',
  styleUrls: ['./manage-change-pin.component.scss'],
})
export class ManageChangePinComponent implements OnInit, OnDestroy {
  formGroup = new FormGroup({}, { updateOn: 'change' });
  changePinSubscription: Subscription;
  constructor(
    public _manageSecurityQuestion: BsModalRef,
    private _modalService: BsModalService,
    private _router: Router,
    private _manageSecurityService: ManageSecurityService,
    private _toastr: ToastrService
  ) { }

  showPassword: boolean;
  enterCurrentPin: boolean;
  forgotPinSubscription: Subscription;

  ngOnInit(): void {
    this.formGroup.addControl(
      'enterCurrentPin',
      new FormControl(null, [Validators.required, Validators.minLength(4),Validators.maxLength(4),Validators.pattern(Constants.onlyNumber)])
    );
    this.formGroup.addControl(
      'createNewPin',
      new FormControl(null, [Validators.required,Validators.pattern(Constants.onlyNumber)])
    );
    this.formGroup.addControl(
      'confirmNewPin',
      new FormControl(null, [Validators.required,Validators.pattern(Constants.onlyNumber)])
    );
    this.formGroup.addControl(
      'acceptTermsAndConditions',
      new FormControl(null, [Validators.requiredTrue])
    );
  }

  onSubmit() {
    let params = {
      CurrentPin: this.formGroup.controls['enterCurrentPin'].value,
      NewPin: this.formGroup.controls['createNewPin'].value,
      ConfirmPin: this.formGroup.controls['confirmNewPin'].value,
    };
    this.changePinSubscription = this._manageSecurityService
      .changePin(params)
      .subscribe((res: API_Response) => {
        if (res.success) {
          this._toastr.success(res.message);
          this.formGroup.reset();
        } else {
          this._toastr.error(res.message);
        }
      });
  }

  onCurrentPinChanged(){
    let value = this.formGroup.controls['enterCurrentPin'].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      enterCurrentPin: numbers,
    });
  }

  onNewPinChanged(){
    let value = this.formGroup.controls['createNewPin'].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      createNewPin: numbers,
    });
  }

  onConfirmPinChanged(){
    let value = this.formGroup.controls['confirmNewPin'].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      confirmNewPin: numbers,
    });
  }

  forgotPin() {
    let initialState = {
      data: this.formGroup.value,
    };
    this._manageSecurityQuestion = this._modalService.show(
      ManageSecurityQuestionModalComponent,
      {
        initialState,
        ignoreBackdropClick: true,
        class: 'modal-md modal-dialog-centered',
      }
    );
    this.forgotPinSubscription = this._modalService.onHide
      .pipe(take(1))
      .subscribe(res => {
        if (this._manageSecurityQuestion?.content?.success) {

        }
      });
  }

  ngOnDestroy() {
    this.changePinSubscription?.unsubscribe();
    this.forgotPinSubscription?.unsubscribe();
  }
}
