/* eslint-disable prettier/prettier */
import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  constructor(private _authService: AuthService, private _router: Router ,private _hfs: HeaderFooterSidebarSettingService, private _commonService: CommonService, private _modalService: BsModalService) {
    let userSession = this._authService.getUserSession();
    if (this._authService.isAuthorized(userSession)) {
      this._commonService.redirectActivatedRoute()
    }
    this._modalService.hide();
  }

  ngAfterViewInit() {
    this.signOut();
  }

  signOut() {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true, isSidebar: false });
  }
}
