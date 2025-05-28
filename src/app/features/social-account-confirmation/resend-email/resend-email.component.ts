import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SocialAccountConfirmationService } from '../social-account-confirmation.service';

@Component({
  selector: 'app-resend-email',
  templateUrl: './resend-email.component.html',
  styleUrls: ['./resend-email.component.scss']
})
export class ResendEmailComponent implements OnInit {
  formGroup: any;

  constructor(private _fb: FormBuilder,
    private bsModalRef: BsModalRef,
    private _socialAccountService: SocialAccountConfirmationService
  ) { }

  ngOnInit(): void {

    this.formGroup = this._fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  resendLink() {
    const param = {
      email: this.formGroup.get('email').value
    }

    this._socialAccountService.resendConfirmationLink(param).subscribe((res) => {
      if (res) {
        this.bsModalRef.hide()
      }
    })
  }

}
