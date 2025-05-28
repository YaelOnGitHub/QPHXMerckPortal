/* eslint-disable prettier/prettier */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { isRegExp } from 'cypress/types/lodash';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  PasswordRegex,
  SecurityPolicy,
} from 'src/app/core/models/security.model';
import { ClientConfigurationDataService } from 'src/app/core/services/client-configuration-data.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { CustomValidators } from 'src/app/core/utilities/custom-validators';
import { ManageSecurityService } from 'src/app/features/manage-security/service/manage-security.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { CommonService } from '../../services/common-service/common.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  @Input() displayBackBtn: boolean = true;
  @Input() loadOldPassword: string = null;
  @Input() isLocationFrom: string = null;
  setPasswordformGroup = new FormGroup({}, { updateOn: 'change' });
  setPasswordSubscripton: Subscription;
  showOldPassword: boolean;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
  submitSuccess: boolean = false;
  passwordRules: PasswordRegex[];
  passwordMinLength: number;
  isPasswordPolicyLoaded: boolean;
  customValidators: any[];
  getClientPasswordPoliciesSubscription: Subscription;

  constructor(
    private _fb: FormBuilder,
    private toastr: ToastrService,
    private _router: Router,
    private _manageSecurityService: ManageSecurityService,
    private _session: SessionService,
    private _common: CommonService,
    private _authService: AuthService,
    private _getConfigurationData: ClientConfigurationDataService
  ) { }

  ngOnInit(): void {
    this.setPasswordformGroup = this.createSetPasswordForm();
    this.getPasswordPolicy();
    let loadOldPassword = this._session.get('userSession')?.userAccount?.displayChangePasswordScreen;
    if (loadOldPassword === 'Y' && this.loadOldPassword === null) {
      this.setPasswordformGroup.patchValue({
        oldPassword: this._session.get('oldPassword'),
      });
    }
  }

  forPasswordRules() {
    this.setPasswordformGroup.get('password').clearValidators();
    this.passwordRules.forEach(rule => {
      let msg = {
        [`${rule.Pattern}`]: true,
      };
      this.setPasswordformGroup
        .get('password')
        .addValidators(
          CustomValidators.patternValidator(RegExp(rule.Pattern), msg)
        );
    });
    this.setPasswordformGroup
      .get('password')
      .addValidators(Validators.minLength(this.passwordMinLength));
  }

  getPasswordPolicy() {
    this.passwordRules = JSON.parse(this._getConfigurationData.getConfigurationData('SECURITY_POLICY'))?.PasswordRegularExpressions;
    this.passwordMinLength = JSON.parse(this._getConfigurationData.getConfigurationData('SECURITY_POLICY'))?.PasswordMinLength;
     this.forPasswordRules();

    // this.getClientPasswordPoliciesSubscription = this._common
    //   .getClientSecurityPolicies()
    //   .subscribe((res: SecurityPolicy[]) => {
    //     this.passwordMinLength =
    //       res['data'].clientSecurityPolicies.passwordMinLength;
    //     this.passwordRules =
    //       res['data'].clientSecurityPolicies.passwordRegularExpressions;
    //     this.isPasswordPolicyLoaded = true;
    //     this.forPasswordRules();
    //   });
  }

  createSetPasswordForm(): FormGroup {
    return this._fb.group(
      {
        oldPassword: ['', [Validators.required]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: CustomValidators.passwordMatchValidator }
    );
  }

  onBack() {
    history.back();
  }

  onSavePassword() {
    this.submitSuccess = true;
    let oldPassword: string = this.setPasswordformGroup.get('oldPassword').value ?? "";
    let password: string = this.setPasswordformGroup.get('password').value ?? "" ;
    let confirmPassword: string = this.setPasswordformGroup.get('confirmPassword').value ?? "";

    let setPasswordParams = {
      OldPassword: oldPassword.trim(),
      NewPassword: password.trim(),
      ConfirmNewPassword: confirmPassword.trim()
    };

    this.setPasswordSubscripton = this._manageSecurityService
      .setPassword(setPasswordParams)
      .subscribe(res => {
        if (res) {
          if (res['success']) {
            this.toastr.success(res['message']);
            this._session.removeItem('oldPassword');
            this._authService.getAccountDetails().subscribe((item) => {
              if (this.isLocationFrom !== 'manageProfile') {
                this._router.navigateByUrl('/security/set-questions');
              }
            });
          } else {
            this.toastr.error(res['message']);
          }
        }
      });
  }

  canDeactivate() {
    return (
      this.setPasswordformGroup.touched &&
      this.setPasswordformGroup.dirty &&
      !this.submitSuccess
    );
  }

  ngOnDestroy() {
    this.setPasswordSubscripton?.unsubscribe();
    this.getClientPasswordPoliciesSubscription?.unsubscribe();
  }
}
