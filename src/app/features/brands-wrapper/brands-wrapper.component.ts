import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { AocService } from '../aoc/aoc.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { StorageType } from 'src/app/shared/enums/storage-type';

@Component({
  selector: 'app-brands-wrapper',
  templateUrl: './brands-wrapper.component.html',
  styleUrls: ['./brands-wrapper.component.scss']
})
export class BrandsWrapperComponent implements OnInit {

  isAocFunctionalityEnabled: boolean = false;
  
  constructor(private _hfs: HeaderFooterSidebarSettingService, private _authService: AuthService, private _aocService: AocService, private _session: SessionService) {

    let configList = this._authService.getUserConfiguration();
      const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
      this.isAocFunctionalityEnabled = aocFunctionality?.keyValue.toLowerCase() == 'true' ? true : false;
   }

   ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: true, isFooter: true, isSidebar: true });
    // Check if the user has logged in before using localStorage or sessionStorage
    if (this.isAocFunctionalityEnabled && this.isFirstLogin()) {
      this.checkAocStatus();
      this.markLogin(); // Mark the login flag after calling the checkAocStatus
    }
  }

  // Function to check if it's the first login
  isFirstLogin(): boolean {
    const firstLoginFlag = localStorage.getItem('firstLogin');
    return !firstLoginFlag; // If flag is not set, it’s the first login
  }

  // Function to mark the first login (set the flag in localStorage)
  markLogin(): void {
    localStorage.setItem('firstLogin', 'false');
  }

  checkAocStatus() {
    if(this.isFirstLogin())
    {
      const aocNonBlockerText = this.getMessageForConfigByKey('AOC_POPUP_NON_BLOCKER_TEXT');
      this._aocService.getAocStatus().subscribe((res) => {
      if (res.data.totalOpenAOCs > 0 && res.data.canUserContinue) {
 
        this._aocService.openAocModal({
          customTitle: 'Open AOCs Notification',
          isCustomTitle: true,
          SubHeading: '',
          icon: 'fa-regular fa-4x fa-light fa-file-text fa-2x',
          Heading: aocNonBlockerText,
          okBtnText: 'Continue',
          cancelBtnRequired: false,
          cancelBtnText: 'Cancel'
        }).subscribe(() => {
        
        });
      } 
    });
    }
  }

  getMessageForConfigByKey(key:string): any{
    let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === key;
    });

    return data[0].keyValueHtml;
  }

}
