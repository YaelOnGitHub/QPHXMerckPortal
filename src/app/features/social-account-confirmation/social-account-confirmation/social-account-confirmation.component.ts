import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialAccountConfirmationService } from '../social-account-confirmation.service';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { SocialVerifyLinkResponse } from 'src/app/core/models/auth.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ResendEmailComponent } from '../resend-email/resend-email.component';
import { DOCUMENT } from '@angular/common';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';

@Component({
  selector: 'app-social-account-confirmation',
  templateUrl: './social-account-confirmation.component.html',
  styleUrls: ['./social-account-confirmation.component.scss']
})
export class SocialAccountConfirmationComponent implements OnInit {
  apiDataLoaded: boolean = false;
  socialLinkResponse: SocialVerifyLinkResponse;

  //By using @Inject(DOCUMENT) instead of public document: Document, 
  //Angular will know to inject the DOCUMENT token and provide the document object at runtime.

  constructor(private _route: ActivatedRoute,
     private _router:Router,
     private _socialService: SocialAccountConfirmationService,
     private _loader: LoaderService,
     public _resendEmailModalRef: BsModalRef,
     private _hfs : HeaderFooterSidebarSettingService,
     @Inject(DOCUMENT) private document: Document,
     private _modalService: BsModalService) {
    this._loader.show(null)
  }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true });
    this.getSocialMediaLink();
  }


  getSocialMediaLink() {
    this._route?.queryParams.subscribe(params => {
      const link = params['link'] || '';
      if (link !== '') {
        const param = {
          TempVerifyLink: decodeURI(link)
        }
        this._socialService.verifySocialMediaLink(param).subscribe((res) => {
          this.socialLinkResponse = res;
          this.apiDataLoaded = true;
        })
      }
    })
  }

  redirectToLogin() {
   if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
      this.document.location.href = `com.qpharma.qpharmarx://`
   } 
    this._router.navigateByUrl('/');
  }

  resendEmail() {
    this._resendEmailModalRef = this._modalService.show(
      ResendEmailComponent,
      {
        ignoreBackdropClick: true,
        class: 'modal-md modal-dialog-centered',
      }
    );
  }

  showLoginButton() {
    return this.socialLinkResponse?.data?.accountStatus == "Active";
  }

  showResendButton() {
    return (this.socialLinkResponse?.data?.accountStatus == "PendingConfirmation" || this.socialLinkResponse?.data?.accountStatus == "Expired");
  }
}
