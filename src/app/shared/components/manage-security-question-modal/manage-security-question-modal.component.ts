/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup ,Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { API_Response } from 'src/app/core/models/common.model';
import { ManageSecurityService } from 'src/app/features/manage-security/service/manage-security.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { SessionService } from 'src/app/shared/services/session.service';

@Component({
  selector: 'app-manage-security-question-modal',
  templateUrl: './manage-security-question-modal.component.html'
})
export class ManageSecurityQuestionModalComponent implements OnInit {
  data: any;
  formGroup = new FormGroup({}, { updateOn: 'change' });;
  securityQuestion: any;
  getSecurityQuestionListSubscription: Subscription;
  checkSecurityQuestionSubscription: Subscription;
  success: boolean;
  questionId: string;

  constructor(private _bsModalRef: BsModalRef, private _authService: AuthService, private _router: Router, private _session: SessionService, private _manageSecurityService: ManageSecurityService, private _toastr: ToastrService) { }

  ngOnInit(): void {
    this.questionId = JSON.parse(sessionStorage.getItem("userSession"))._value.userAccount.securityQuestionId;
    this.formGroup.addControl('securityAnswer', new FormControl(null, [Validators.required]));
    this.getSecurityQuestionListSubscription = this._manageSecurityService.getClientSecurityQuestions().subscribe(res => {
      this.securityQuestion = res['data'].questions.find(q => {
        return q.id === this.questionId;
      })
    })
  }

  navigate() {
    this.closeModal();
  }

  onSave() {
    let params = {
      "SecurityQuestionId": this.questionId,
      "SecurityQuestionAnswer": this.formGroup.controls['securityAnswer'].value,
    }
    this.checkSecurityQuestionSubscription = this._manageSecurityService.verifyPin(params).subscribe((res: API_Response) => {
      if (res.success) {
        this._toastr.success(res.message);
        this.success = true;
        this._authService.getAccountDetails().subscribe((account) => {
          if (account.success) {
            this._router.navigateByUrl('/security/create-pin');
          }
        });
        this.closeModal();
      }
      else {
        this.success = false;
        this._toastr.error(res.message);
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.checkSecurityQuestionSubscription?.unsubscribe();
    this.getSecurityQuestionListSubscription?.unsubscribe();
    this._bsModalRef.hide();
  }

}
