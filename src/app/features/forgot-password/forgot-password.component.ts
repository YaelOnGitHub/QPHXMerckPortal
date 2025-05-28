import { Component, OnInit } from '@angular/core';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { Constants } from 'src/app/core/utilities/constants';
import { forgotPasswordRequest } from 'src/app/core/models/forgot-password.model';
import { Subscription } from 'rxjs';
import { ForgotPasswordService } from './service/forgot-password.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  formGroup: FormGroup;
  forgotPasswordSubscription: Subscription;
  constructor(private _router: Router, private _hfs: HeaderFooterSidebarSettingService, private _toastr: ToastrService, private _fb: FormBuilder, 
    private _forgetPasswordService: ForgotPasswordService,private _alertService: AlertService) { }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true, isSidebar: false });
    this.formGroup = this._fb.group({
      email: ['', [Validators.required, Validators.pattern(Constants.emailAddressPattern)]]
    })
  }

  onResetPassword() {
    let resetPasswordParam: forgotPasswordRequest = this.formGroup.value;
    this.forgotPasswordSubscription = this._forgetPasswordService.forgotPassword(resetPasswordParam).subscribe((response:any) => {
      if (response.success && response.apiMessageCode !== 'BAD_REQUEST_PASSWORD_RESET_RESTRICTED') {
        this._toastr.success(response.message);
        this._router.navigateByUrl('login')
      } else if (response.success && response.apiMessageCode == 'BAD_REQUEST_PASSWORD_RESET_RESTRICTED') {
        this._alertService.error({ Heading: '',customTitle:'Password reset restricted',isCustomTitle: true, SubHeading: 'The email address that you have entered is associated with a user account that is enrolled for signing in to this site via Google/Apple. Hence, password reset is not allowed for this user account on this site. Please go back to Login page and use the Google/Apple access option by clicking on the relevant icon on the page', icon: 'fa fa-ban fa-solid fa-circle-exclamation' }).subscribe((res) => {
          this._router.navigateByUrl('login');
        })
      }
    });
  }

  onBackToHistory() {
    history.back();
  }

}
