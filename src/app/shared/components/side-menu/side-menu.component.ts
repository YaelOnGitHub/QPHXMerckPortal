import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonService } from '../../services/common-service/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { StorageType } from '../../enums/storage-type';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SideMenuComponent implements OnInit {
  isAocEnabled: boolean = false;
  activeItem: string = '';

  constructor(private _commonService: CommonService, private _router: Router, private _session: SessionService, private _authService: AuthService) {
    const configList = this._authService.getUserConfiguration();
    const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
    this.isAocEnabled = aocFunctionality?.keyValue.toLowerCase() === 'true';
  }

  ngOnInit(): void {
    // Subscribe to router events
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveItem();
    });

    // Initial check
    this.checkActiveItem();
  }

  checkActiveItem() {
    const currentUrl = this._router.url;

    if (currentUrl.includes('/manage-aoc')) {
      this.activeItem = 'aoc';
    } else if (currentUrl.includes('/brands')) {
      this.activeItem = 'samples'; // Update for brands route if needed
    } else if (currentUrl.includes('/ai-expert')) {
      this.activeItem = 'ai-expert'; // Update for brands route if needed
    }
  }

  redirectToRoute(target:string) {
    this.activeItem = target;

    if (target === 'samples'){
      this._commonService.redirectActivatedRoute();
    } else if(target === 'ai-expert'){
        this._router.navigateByUrl('/ai-expert');
    }
  }

  getMessageForConfigByKey(key: string): any {
    const data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === key;
    });

    if (data && data.length > 0) {
      return data[0].keyValue;
    }

    return null; // Return null if the key is not found
  }

  public redirectToAoc() {
    this.activeItem = 'aoc';
    this._router.navigateByUrl('/manage-aoc');
  }
}
