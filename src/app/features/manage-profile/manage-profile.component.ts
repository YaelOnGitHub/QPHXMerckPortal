/* eslint-disable prettier/prettier */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable prettier/prettier */

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';


interface ITab {
    title: string;
    // content: string;
    // removable: boolean;
    disabled: boolean;
    active?: boolean;
    customClass?: string;
    router: string
    show?: boolean
}

@Component({
    selector: 'app-manage-profile',
    templateUrl: './manage-profile.component.html',
    styleUrls: ['./manage-profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ManageProfileComponent implements OnInit {

    public tabs: ITab[] = [
        { title: 'PROFILE', disabled: false, router: 'profile', active: false, show: true },
        { title: 'MANAGE ADDRESSES', disabled: false, router: 'address', active: false,show: true },
        { title: 'MANAGE LICENSES', disabled: false, router: 'licenses', active: false, show: true },
        { title: 'AUTOMATED REQUESTS', disabled: false, router: 'subscriptions', active: false, show: true },
        { title: 'CHANGE PASSWORD', disabled: false, router: 'password', active: false, show: true },
        { title: 'CHANGE PIN', disabled: false, router: 'pin', show: true }
    ];

    constructor(private router: Router,private _commonService: CommonService, private _authService: AuthService, private activeRoute: ActivatedRoute, private _hfs: HeaderFooterSidebarSettingService) { }

    onSelectActiveTab(currentTab: string) {

        this.tabs.findIndex((item, index) => {
            if (item.router?.includes(currentTab)) {
                this.tabs[index].active = true
            } else {
                this.tabs[index].active = false
            }
        });
    }

    onTabSelect(data: TabDirective) {
        this.router.navigateByUrl(`/manage/${data?.id}`);
    }

    redirectToBack() {
      this._commonService.redirectActivatedRoute()
    }

    ngOnInit(): void {
        if (this.activeRoute.snapshot['_routerState'].url) {
            this.router.navigateByUrl(`${this.activeRoute?.snapshot['_routerState']?.url}`);
            this.onSelectActiveTab(this.activeRoute?.snapshot['_routerState']?.url?.split('/')[2]);
        }
        // this._authService.getAccountDetails().subscribe((accountDetails) => {
        //     if (accountDetails.success) {
               
        //     }
        // })
        this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: true, isFooter: true, isSidebar: true });
        const type = this._authService.getSocialMediaLoginInfo()
        const isSocialLogin =  type !== 'manual' && type !== '' ? true : false
        if(isSocialLogin) {
          this.tabs.map(tab => {
            if(tab.router == 'password') {
              tab.show = false;
            }
          })
        }
    }
}
