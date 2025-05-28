/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';

@Component({
  selector: 'app-manage-security',
  templateUrl: './manage-security.component.html',
  styleUrls: ['./manage-security.component.scss']
})
export class ManageSecurityComponent implements OnInit {

  displayChangePasswordScreen: string;

  constructor(private _router: Router,
    private _authService: AuthService,
    private _hfs: HeaderFooterSidebarSettingService) { }

  ngOnInit(): void {
 
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true, isSidebar: false });
   
  }

  onCheckTheProfileShow() {
    this._authService.userSessionStream$.subscribe((accountDetails) => {
      if (accountDetails?.userAccount) {
        this.displayChangePasswordScreen = accountDetails?.userAccount['displayChangePasswordScreen'];
      }
    });
  }
}
