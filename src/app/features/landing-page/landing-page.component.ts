/* eslint-disable prettier/prettier */
import { AfterViewInit, HostListener } from '@angular/core';
import {Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { ScriptLoaderService } from 'src/app/core/services/script-loader-service';
import { LoginComponent } from '../login/login.component';
import { Constants } from 'src/app/core/utilities/constants';
import { CookieManagementService } from 'src/app/shared/services/cookie-management.service';
import { appleSocialIdConfig } from 'src/app/core/config/social-login.config';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { AppleAccountVerificationRequest, AuthRequest, SocialAccountVerificationRequest, SocialAccountVerificationResponse, SocialLoginRequest } from 'src/app/core/models/auth.model';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { Subscription } from 'rxjs';
import { SrfLinkService } from '../srf-link/srf-link.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { SocialAccountConfirmationService } from '../social-account-confirmation/social-account-confirmation.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { LoginService } from 'src/app/features/login/login.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
    dcmHtml: SafeHtml;
    // Declare height and width variables
    scrHeight: any;
    scrWidth: any;
    isMerck: boolean = false;
    isQphma: boolean = false;
    previousUrl: string;
    subscription1$: Subscription;
    isSocialMediaEnable: boolean = false;
    enableLogin:boolean = true;
    showLoginModalSub: Subscription;

  constructor(public translate: TranslateService,
    private _hfs: HeaderFooterSidebarSettingService, 
    private _authService: AuthService,
    private route: ActivatedRoute,
    private _cookieService: CookieManagementService,
    private _router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private _toastr: ToastrService,
    private _socialAuthService: SocialAuthService,
    private _commonService: CommonService,
    private _activatedRoute: ActivatedRoute,
    private _jwtService: JwtHelperService,
    private _srfLinkService: SrfLinkService,
    private _alertService: AlertService,
    private _socialAccountService: SocialAccountConfirmationService,
    private _entitlementService: EntitlementService,
    private _loginService: LoginService,
    public _showLoginModalRef: BsModalRef, 
    private _modalService: BsModalService,
  ) {
    
    this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable();

  }

  
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
  }
  registration() {

    // Access the full query string from the current URL
    const queryParams = this.route.snapshot.queryParams;
    // Convert the query parameters object into a query string
    const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&');
      
    this._router.navigateByUrl('/registration?'+queryString);
  }


  ngOnInit() {
    this.onGoogleAuthState();
    const configList = this._authService.getUserConfiguration();
    this.isMerck = configList[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false
    this.isQphma = configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false
   
    this.previousUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '';
    this._hfs.hfsSetting.next({
      isHeader: true,
      isAuthHeader: false,
      isFooter: true,
      isSidebar: false,
    });
    this.getScreenSize();  
  }

  ngAfterViewInit(): void {

    this.addBanner();
  }

  ngOnDestroy() {

    this.subscription1$?.unsubscribe();
    if (this.showLoginModalSub) {
      this.showLoginModalSub.unsubscribe();
    }

    this.subscription1$ = null
  }

  get isFirstLoad(): any {
    return this._authService.isFirstLoad;
  }

  addBanner() {
    // Create an iframe dynamically
    const iframe = this.renderer.createElement('iframe');
    //this.renderer.setStyle(iframe, 'width', '750px');
    // this.renderer.setStyle(iframe, 'height', '100px');
    // this.renderer.setStyle(iframe, 'border', '0');
    // this.renderer.setStyle(iframe, 'overflow', 'hidden');
    this.renderer.setAttribute(iframe, 'srcdoc', this.getAdHtml());
    this.renderer.appendChild(this.el.nativeElement.querySelector('#ad-container'), iframe);
  }
  
  getAdHtml() {
    // Prepare the HTML content for the iframe
    const adHtmlContent = `
      <ins class='dcmads' style='display:inline-block;width:728px;height:90px'
          data-dcm-placement='N1921784.4640759MMSI_EHR/B30783521.378454979'
          data-dcm-rendering-mode='script'
          data-dcm-https-only
          data-dcm-api-frameworks='[APIFRAMEWORKS]'
          data-dcm-omid-partner='[OMIDPARTNER]'
          data-dcm-gdpr-applies='gdpr=\${GDPR}'
          data-dcm-gdpr-consent='gdpr_consent=\${GDPR_CONSENT_755}'
          data-dcm-addtl-consent='addtl_consent=\${ADDTL_CONSENT}'
          data-dcm-ltd='false'
          data-dcm-resettable-device-id=''
          data-dcm-app-id=''>
        <script src='https://www.googletagservices.com/dcm/dcmads.js'></script>
      </ins>
    `;
  

  
    return adHtmlContent;
  }
  

  addBanner1(){

      // Create the <ins> element
      // const ins = this.renderer.createElement('ins');
      // this.renderer.setAttribute(ins, 'class', 'dcmads');
      // this.renderer.setStyle(ins, 'display', 'inline-block');
      // this.renderer.setStyle(ins, 'width', '728px');
      // this.renderer.setStyle(ins, 'height', '90px');
      // Add all other data attributes as required by the ad tag

      const ins = this.renderer.createElement('ins');
      this.renderer.addClass(ins, 'dcmads');
     // this.renderer.setStyle(ins, 'display', 'inline-block');
      this.renderer.setStyle(ins, 'width', '728px');
      this.renderer.setStyle(ins, 'height', '90px');
      this.renderer.setAttribute(ins, 'data-dcm-placement', 'N1921784.4640759MMSI_EHR/B30783521.378454979');
      this.renderer.setAttribute(ins, 'data-dcm-rendering-mode', 'script');
      this.renderer.setAttribute(ins, 'data-dcm-https-only', '');
      this.renderer.setAttribute(ins, 'data-dcm-api-frameworks', '[APIFRAMEWORKS]');
      this.renderer.setAttribute(ins, 'data-dcm-omid-partner', '[OMIDPARTNER]');
      this.renderer.setAttribute(ins, 'data-dcm-gdpr-applies', 'gdpr=${GDPR}');
      this.renderer.setAttribute(ins, 'data-dcm-gdpr-consent', 'gdpr_consent=${GDPR_CONSENT_755}');
      this.renderer.setAttribute(ins, 'data-dcm-addtl-consent', 'addtl_consent=${ADDTL_CONSENT}');
      this.renderer.setAttribute(ins, 'data-dcm-ltd', 'false');
      this.renderer.setAttribute(ins, 'data-dcm-resettable-device-id', '');
      this.renderer.setAttribute(ins, 'data-dcm-app-id', '');
  
      // Append the <ins> element to the ad container
      this.renderer.appendChild(this.el.nativeElement.querySelector('#ad-container'), ins);
  
      // Create the <script> element
      //const script = this.renderer.createElement('script');
     // script.src = 'https://www.googletagservices.com/dcm/dcmads.js';
      //this.renderer.appendChild(ins, script);

      //const head = this.renderer.createElement('head');
      //this.renderer.appendChild(head, script);
    
  }
  onRedirectToRegister(isDirect = false) {
    if(isDirect) {
      this._cookieService.deleteCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    }
    this._router.navigateByUrl('/registration');
  }

  forgotPassword() {
    this._router.navigateByUrl('/forgotPassword');
  }

  loginQphma() {
    let userSession = this._authService.getUserSession();
    if (this._authService.isAuthorized(userSession)) {
      this._commonService.redirectActivatedRoute()
    }
    else{

      this.showLogin();
    }
  }

  login() {
    // Access the full query string from the current URL
    const queryParams = this.route.snapshot.queryParams;
    // Convert the query parameters object into a query string
    const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&');

    this._router.navigateByUrl('/login?'+queryString);
  }

  showLogin() {
    let initialState = {
        data: {},
        isPopUp: true,
        backdrop:"dynamic"
    }
    this._showLoginModalRef =
        this._modalService.show(LoginComponent, { initialState, ignoreBackdropClick: true, class: 'custom-modal'});

        this.showLoginModalSub = this._showLoginModalRef.content.onLoggedIn.subscribe(() => {
          this._modalService.hide();
        });
}

  async onAppleAuthLogin() {

    const handleAppleLoginResponse = (event) => {
      this.processAppleLoginResponse(event)
      // Remove the event listener after processing the response
      window.removeEventListener('message', handleAppleLoginResponse);
    };

    window.addEventListener('message', handleAppleLoginResponse);
    
    window.open(
      `${appleSocialIdConfig.APPLE_END_URL}client_id=${appleSocialIdConfig.CLIENT_ID}&redirect_uri=${encodeURIComponent(appleSocialIdConfig.REDIRECT_URL)}&response_type=code id_token&scope=name email&response_mode=form_post`,
      '_blank'
    );
  }

  getDataObject(queryString: string): { [key: string]: string } {
    const queryParams = new URLSearchParams(queryString);
    const paramsObject: { [key: string]: string } = {};
  
    queryParams.forEach((value, key) => {
      paramsObject[key] = value;
    });
    return paramsObject;
  }

  processAppleLoginResponse(event) {
    const data = this.getDataObject(event.data)
    const decodedToken = this._jwtService.decodeToken(data['id_token']);

    let socialRequest: AppleAccountVerificationRequest;

    if (data['user']) {
      const userName = JSON.parse(data['user']);
      socialRequest = {
        idToken: data['id_token'],
        provider: 'APPLE',
        platform: 'WEB',
        FirstName: userName.name.firstName,
        LastName: userName.name.lastName
      };
    } else {
      socialRequest = {
        idToken: data['id_token'],
        provider: 'APPLE',
        platform: 'WEB',
      };
    }
    const user = {
      provider: 'APPLE',
      email: decodedToken?.email,
      id: decodedToken?.sub,
    }

    // Remove event listener in order to prevent from getting previous messages
    window.removeEventListener('message', function () { })

    this._authService.socialAccountInit(socialRequest).subscribe((res) => {
      if (res.success) {
        this._modalService.hide();
        if (res.data.isRegistrated == false) {

          this.storeSocialMediaInfo(res, user)

          //2. Redirect user to registration page
          this.onRedirectToRegister();
        }
        else {
          //3. Call Social Login API
          this.socialLogin(user, res);
        }
      }
    })

  }

  storeSocialMediaInfo(res,user) {
    const socialMediaInfo = {
      authenticationCode: res.data.authenticationCode,
      provider: user.provider,
      email: user.email
    }
    this._cookieService.setCookie(socialMediaInfo,Constants.SOCIAL_MEDIA_COOKIE_KEY)
  }

 async onGoogleAuthState() {
    this.subscription1$ = this._socialAuthService.authState.subscribe((user) => {
      if(user){
        this.socialAccountVerification(user);
      }
      
        // if(user && this.isFirstLoad) {
        //   this.socialAccountVerification(user);
        //   this._authService.setFirstLoad(false)
        // } else {
        //   this._authService.setFirstLoad(true)
        // }
      });
  }

 async socialAccountVerification(user: SocialUser) {
      //1. SocialAccountVerification
      let socialRequest: SocialAccountVerificationRequest = {
          idToken: user.idToken,
          provider: user.provider,
          platform: 'WEB'
      };
      this._authService.socialAccountInit(socialRequest).subscribe((res) => {
          if (res.success) {
              if(res.data.isRegistrated == false)
              {
                
                this.storeSocialMediaInfo(res,user)
      
                //2. Redirect user to registration page
                this.onRedirectToRegister();
              }
              else
              {
                  //3. Call Social Login API
                 this.socialLogin(user,res);
              }
          }
      })
  }

 async socialLogin(user , reponseData: SocialAccountVerificationResponse) {
     
      //3. SocialAccountVerification
      let socialLoginRequest: SocialLoginRequest = {
            email: user.email,
            socialId: user.id,
            provider: user.provider,
            authenticationCode: reponseData.data.authenticationCode               
      };
      this._authService.socialLogin(socialLoginRequest).subscribe((res:any) => {
          if (res.success && res.apiMessageCode == 'UNAUTHORIZED_ACCESS_SOCIAL_PROFILE_PENDING') {
           
            let msg = `${res.message} or click on resend button to get new confirmation link.`
            this._alertService.confirm({ customTitle: 'Resend Confirmation Link',extraText : msg, 
            textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: true, isRequiredOkBtn: true, okBtnText: 'Resend' }).subscribe((resp)=> {
              if(resp) {
                this._socialAccountService.resendConfirmationLink({email: user?.email}).subscribe((res) => {
                  if(res.success) {
                    this._toastr.success('Confirmation link has been sent to your email.');
                  }
              })
            }
          })
            
          }
           else if(res.success){ 
              this.getAccountDetails();
              this.checkPendingSRF();
              this._loginService.setLogin.next(true);
              this._modalService.hide();
          } 
      })
  }

  checkPendingSRF() {
    if(this.previousUrl !== '') return
    this._srfLinkService.checkPendingSRF().subscribe((srf) => {
      if(srf.data?.srfAvailable) {
        this._srfLinkService.openSRFModal({ customTitle: 'Automated Request Notification', isCustomTitle: true, SubHeading: '', icon: 'fa-regular fa-4x fa-light fa-file-text fa-2x', Heading: 'You have enrolled in Automated Requests, and the additional samples are now available. To review and submit your request, select Continue. If necessary, you could include additional products or make modifications to the selection before submitting the request.', okBtnText: 'Continue', cancelBtnRequired:false ,cancelBtnText: 'Cancel' }).subscribe((result) => {
          if(result) {
            this._router.navigateByUrl('srf-link')
          }
      })
    }
    })
  }
 
  isProfileCompletionPending(accountDetails) {
    let account = accountDetails.data.UserDetails
    if (account?.displayChangePasswordScreen === 'Y') {
        this._router.navigateByUrl('/security/set-password');
        return false;
    } else if (account?.displaySetSecurityQuestionScreen === 'Y') {
        this._router.navigateByUrl('/security/set-questions');
        return false;
    } else if (account?.displaySetPinScreen === 'Y') {
        this._router.navigateByUrl('/security/create-pin');
        return false;
    } else {
        return false;
    }
  }

  getAccountDetails() {
      this._authService.getAccountDetails().subscribe((accountDetails) => {
          if (accountDetails.success) {
              this._toastr.success('Logged in successfully!');
              if (this.isProfileCompletionPending(accountDetails)) {
              } else {
                if(this.previousUrl !== '') {
                  this._router.navigateByUrl(this.previousUrl)
                  return;
                } 
                this._commonService.redirectActivatedRoute()
              }
          } 
      })
  }

}
