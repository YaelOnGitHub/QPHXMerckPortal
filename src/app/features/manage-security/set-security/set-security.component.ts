import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { SecurityQuestions } from 'src/app/core/models/security.model';
import { UserSession } from 'src/app/core/models/user-session.model';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { ManageSecurityService } from '../service/manage-security.service';

interface SecurityQuestion {
  displayOrder: number;
  id: string;
  question: string;
}

@Component({
  selector: 'app-set-security',
  templateUrl: './set-security.component.html',
  styleUrls: ['./set-security.component.scss'],
})
export class SetSecurityComponent {
  formGroup: FormGroup;
  headerData =
    '<h1>Set Security Question and Answer</h1><p>Please select security question and send answer to reset your password.</p>';
  securityQuestionList: SecurityQuestion[];
  addSecuritySubscripton: Subscription;
  getSecurityQuestionListSubscription: Subscription;
  submitSuccess: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _manageSecurityService: ManageSecurityService,
    private _router: Router,
    private toastr: ToastrService,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService
  ) { 
    const userSession: UserSession = this._authService.getUserSession();
    if (userSession.userAccount['displaySetSecurityQuestionScreen'] == 'Y') {
      // this._router.navigateByUrl('/security/set-password');
    } else {
      this._router.navigateByUrl('/security/create-pin');
    }
  }

  ngOnInit() {

    this.securityQuestionList =
      this._activatedRoute.snapshot.data[
        'securityQuestions'
      ].data.data.questions;
    this.formGroup = this._fb.group(
      {
        securityQuestions: ['', Validators.required],
        securityAnswer: ['', Validators.required],
      },
      { updateOn: 'change' }
    );
  }

  navigate() {
    this._router.navigateByUrl('/security/set-password');
  }

  onSave() {
    this.submitSuccess = true;
    let params = {
      SecurityQuestionId: this.formGroup.get('securityQuestions').value,
      SecurityQuestionAnswer: this.formGroup.get('securityAnswer').value,
    };
    this.addSecuritySubscripton = this._manageSecurityService
      .addSecurityQuestion(params)
      .subscribe((res: SecurityQuestions[]) => {
        if (res['success']) {
          this.toastr.success(res['message']);
          this._authService.getAccountDetails().subscribe((item) => {
            this._router.navigateByUrl('/security/create-pin');
          });
        } else {
          this.toastr.error(res['message']);
        }
      });
  }

  unsubscribe() {
    this.addSecuritySubscripton?.unsubscribe();
    this.getSecurityQuestionListSubscription?.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
