import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { Constants } from 'src/app/core/utilities/constants';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { CookieManagementService } from 'src/app/shared/services/cookie-management.service';
import { SessionService } from 'src/app/shared/services/session.service';

(window as any).webkit.messageHandlers;
interface Window {
  webkit?: any;
}
declare var window: Window;
@Component({
  selector: 'app-registration-confirmation',
  templateUrl: './registration-confirmation.component.html',
  styleUrls: ['./registration-confirmation.component.scss'],
})
export class RegistrationConfirmationComponent implements OnInit {
  headerData;
  clientConfig;
  isSocialMediaEnable: boolean = false;
  isMerck: boolean = false;
  isQphma: boolean = false;
  isSocialLogin: boolean = false;
  socialMediaData: any;
  hcpName: string = '';
  designation: string = '';
  refferalRedirect: string = '';

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _commonService: CommonService,
    private _session : SessionService,
    private _cookieService: CookieManagementService,
    private _router: Router,
    private route: ActivatedRoute,
    private _socialAuthService: SocialAuthService
  ) {
      // Access the full query string from the current URL
      const queryParams = this.route.snapshot.queryParams;
      // Convert the query parameters object into a query string
      this.refferalRedirect = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&');
             
  }

  ngOnInit(): void {
    this.clientConfig = this._session.get('clientConfig');
    this._activatedRoute.queryParams.subscribe(params => {
      this.hcpName = params['name'];
      this.designation = params['designation'];
    });
    this.getSocialMediaInfo();
    this.isMerck = this.clientConfig[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false; 
    this.isQphma = this.clientConfig[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false; 
  }

  getSocialMediaInfo() {
    this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable();
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
      this.socialMediaData = this._cookieService.getCookieFromIOS(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    } else {
      this.socialMediaData = this._cookieService.getCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    }

    const type = (this.socialMediaData?.provider || '').toLowerCase();
    this.isSocialLogin = type !== 'manual' && type != '' ? true : false
    this._cookieService.deleteCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
  }


  onRedirectLogin() {
    if(this.isQphma){
      this._socialAuthService.signOut(true).then().catch((err)=>{});
      this._router.navigateByUrl(`/`);
    }
    else{
      this._router.navigateByUrl(`/login?${this.refferalRedirect}`);
    }
   

    // For IOS, to redirect on IOS loign page
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      if (window?.webkit?.messageHandlers) console.log('webkit is working');
      document.addEventListener('click', function () {
        window.webkit?.messageHandlers.iosListener.postMessage('login-successful!');
      });
    } else {
      console.log('not working for window');
    }
  }
}
