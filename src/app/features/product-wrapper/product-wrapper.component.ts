import { Component, OnInit } from '@angular/core';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';

@Component({
  selector: 'app-product-wrapper',
  templateUrl: './product-wrapper.component.html',
  styleUrls: ['./product-wrapper.component.scss']
})
export class ProductWrapperComponent implements OnInit {

  constructor(private _hfs: HeaderFooterSidebarSettingService) { }

  ngOnInit() {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: true, isFooter: true, isSidebar: true });
  }

}
