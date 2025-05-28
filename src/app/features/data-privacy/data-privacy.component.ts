
import { Component } from '@angular/core';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';

@Component({
  selector: 'data-privacy',
  templateUrl: './data-privacy.component.html',
  styleUrls: ['./data-privacy.component.scss']
})
export class DataPrivacyComponent {
  
  constructor(private _hfs: HeaderFooterSidebarSettingService) { 
  }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true });
  }

  
}


