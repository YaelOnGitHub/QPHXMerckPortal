/* eslint-disable prettier/prettier */

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { appleSocialIdConfig } from 'src/app/core/config/social-login.config';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { AppleAccountVerificationRequest, AuthRequest, SocialAccountVerificationRequest, SocialAccountVerificationResponse, SocialLoginRequest } from 'src/app/core/models/auth.model';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { CookieManagementService } from 'src/app/shared/services/cookie-management.service';
import { Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/core/utilities/constants';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { SrfLinkService } from '../srf-link/srf-link.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginService } from './login.service';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { SocialAccountConfirmationService } from '../social-account-confirmation/social-account-confirmation.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { filter } from 'rxjs/operators';
import { AocService } from '../aoc/aoc.service';
import { StorageType } from 'src/app/shared/enums/storage-type';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

    private readonly maxInvalidAttempts = 5;
    private readonly lockoutDurationInMinutes = 30;
    private readonly lockoutKey = 'user_lockout';
    private readonly attemptsKey = 'invalid_attempts';
    private readonly usernameKey = 'user_';

    companyLogo: string = 'qpharmaRx-login';
    companyFooterLogo: string = 'qpharmaRx-login-footer';
    showPassword: boolean;
    isInvalidUsername: boolean = false;
    isInvalidPassword: boolean = false
    isSocialMediaEnable: boolean = false
    subscription1$: Subscription
    loginSourcePath = ''
    loginSourceToken = ''
    userName = ''
    isNewBrandBanner: boolean = false;
    loginForm = new FormGroup({});
    configList: any;
    isQPHARMA : boolean = false;
    previousUrl: string
    stateList: any = [];
    isPopUp:boolean = false;
    onLoggedIn: Subject<boolean>;
    clientConfig: any;
    isAocFunctionalityEnabled: boolean = false;

    constructor(private _router: Router,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _socialAuthService: SocialAuthService,
        private _hfs: HeaderFooterSidebarSettingService,
        private _commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
        private _jwtService: JwtHelperService,
        private _loginService: LoginService,
        private _srfLinkService: SrfLinkService,
        private _alertService: AlertService,
        private _cookieService: CookieManagementService,
        private _socialAccountService: SocialAccountConfirmationService,
        private _entitlementService: EntitlementService,
        private _session: SessionService,
        private _aocService: AocService) {

        let userSession = this._authService.getUserSession();
        if (this._authService.isAuthorized(userSession)) {
          this._commonService.redirectActivatedRoute()
        }
        this.configList = this._authService.getUserConfiguration();
        this.isQPHARMA = this.configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID;

        if(this.isQPHARMA){
          this._router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe((event: NavigationEnd) => {
            if (event.url.includes('login')) {
              this._router.navigate(['/']);
            }
          });
        }

        this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable()
        this._activatedRoute.queryParams.subscribe(params => {
          
          this.loginSourcePath = params['ref'] ?? params['source'] ?? null;

          this.loginSourceToken = params['startURL'] || null;
      });
      let configList = this._authService.getUserConfiguration();
      const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
      this.isAocFunctionalityEnabled = aocFunctionality?.keyValue.toLowerCase() == 'true' ? true : false;
      
    }

    get isFirstLoad(): any {
      return this._authService.isFirstLoad;
    }

    
    ngOnInit(): void {
        this.onLoggedIn = new Subject();
        this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true })
        this.loginForm.addControl('username', new FormControl(null, Validators.required));
        this.loginForm.addControl('password', new FormControl(null, Validators.required));
        this.loginForm.addControl('orgState', new FormControl(null))
        this.onGoogleAuthState();
        this.previousUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '';

        // For Merck Cookie feature bypass login and redirect to the application
        if(this.loginSourceToken !== null && !this.isQPHARMA) {
          this.bypassLoginValidation()
        }

        if(this.isQPHARMA) {
          const isLoginModalImage = this._entitlementService.hasEntitlementMatchForOrderPlace('LOGIN_MODAL_IMAGE')
          this.isNewBrandBanner = isLoginModalImage == null
          this.startTimer()
        }
    }

    bypassLoginValidation() {
      const date = new Date()
      let future = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000));

      const token = {
        accessToken: this.loginSourceToken,
        refreshToken : this.loginSourceToken,
        createdAt: date.toISOString(),
        expiresIn : future.toISOString()
      }
      this._authService.saveUserSession(token);
      this.getAccountDetails();

      if(this.isAocFunctionalityEnabled){
        this.checkAocStatus(); 
      }
     
     
      
    }

    startTimer(): void {
      // set timeout for 10 seconds to close the brand modal
      setTimeout(() => this.closeModal(), 10000);
    }
    closeModal() {
      this.isNewBrandBanner = true
    }
    
    ngAfterViewInit() {
        this.signOut();
    }

    ngOnDestroy() {
      this.subscription1$?.unsubscribe()
    }

    

    signIn() {

        let username: string = this.loginForm.get('username')?.value ?? "";
        let password: string = this.loginForm.get('password')?.value ?? "" ;
        
        this.userName = username;
        if (username == '' || password == ''  || this.loginForm.invalid) {
            this.isInvalidUsername = username === '' || username == null ? true : false;
            this.isInvalidPassword = password === '' || password == null ? true : false;
            this._toastr.error(
                'Please fill the required fields!',
            );
            return;
        }

        if(this.checkIfuseralreadyLocked()) {
          this._toastr.error(
            'You have made 5 invalid attempts, your account is locked for 30 mintues.',
          );
          return;
        }

        //reset error
        this.isInvalidPassword = false;
        this.isInvalidUsername = false;
        
        let authObj: AuthRequest = {
            username: username.trim(),
            password: password.trim(),
            Source : this.loginSourcePath
        };
        this._authService.login(authObj).subscribe((res) => {
            if (res.success) {
                this.onLoggedIn.next(true);
                this.getAccountDetails();
                if(this.isAocFunctionalityEnabled){
                  this.checkAocStatus();
                } else {
                  this.checkPendingSRF();

                }
                this._session.setItem('oldPassword', password);
                this._loginService.setLogin.next(true)
                // Reset invalid attempts and username if the login is successful
                this.unlockUser()
            } 
          }, (error) => {
          // Handle the error here
          if(error.status == 400 && error.error.apiMessageCode == "BAD_REQUEST_USERNAME_OR_PASSWORD_INVALID") {
            this.handleBlockUser(error.error)
          }
        })
    }

  handleBlockUser(err) {
    const key = this.usernameKey + this.userName
    const storedUsername = JSON.parse(localStorage.getItem(key));

    // Check if the user is the same as the last stored username
    if (storedUsername?.username === this.userName) {
      this.incrementInvalidAttempts();
      // Check if the user should be locked out
      if (this.isLockedOut()) {
        // User is locked out
        this._toastr.error(
          'You have made 5 invalid attempts, your account is locked for 30 mintues.',
        );
        return;
      }
      this._toastr.error(err.message)

    } else {
      // If it's a different user, reset the invalid attempts and store the user      
      this.storeUserInfo()
      this._toastr.error(err.message)
    }

  }

  storeUserInfo(attempt = '1', lockoutKey = null) {
    const userKey = this.usernameKey + this.userName;
    const obj = {
      username: this.userName,
      lockoutKey: lockoutKey,
      invalid_attempts: attempt
    }
    localStorage.setItem(userKey, JSON.stringify(obj))
  }

  getUserInfo() {
    const key = this.usernameKey + this.userName
    const userObj = JSON.parse(localStorage.getItem(key));
    return userObj;
  }


  private checkIfuseralreadyLocked(): boolean {
    const attempts = this.getInvalidAttempts();
    if (attempts + 1 >= this.maxInvalidAttempts) {
      const obj = this.getUserInfo()
      const lockoutTimestamp = obj?.lockoutKey;
      if (lockoutTimestamp) {
        const lockoutTime = parseInt(lockoutTimestamp, 10);
        const currentTime = new Date().getTime();
        const lockoutDurationInMilliseconds = this.lockoutDurationInMinutes * 60 * 1000;

        if (currentTime - lockoutTime < lockoutDurationInMilliseconds) {
          return true; // User is still locked out
        }
      }
      return false;
    }
    return false
  }

  private isLockedOut(): boolean {
    const attempts = this.getInvalidAttempts();
    if (attempts >= this.maxInvalidAttempts) {
      const obj = this.getUserInfo()
      const lockoutTimestamp = obj?.lockoutKey;
      if (lockoutTimestamp) {
        const lockoutTime = parseInt(lockoutTimestamp, 10);
        const currentTime = new Date().getTime();
        const lockoutDurationInMilliseconds = this.lockoutDurationInMinutes * 60 * 1000;

        if (currentTime - lockoutTime < lockoutDurationInMilliseconds) {
          return true; // User is still locked out

        } else {
          // Lockout duration has passed, reset attempts and unlock user
          this.unlockUser();
        }
      } else {
        // Lockout timestamp not found, lock the user
        this.lockUser();
      }
    }

    return false;
  }


    private lockUser(): void {
      const lockoutTime = new Date().getTime();
      const obj = this.getUserInfo()
      this.storeUserInfo(obj?.invalid_attempts ,lockoutTime)
    }

    private unlockUser(): void {
      localStorage.removeItem(this.usernameKey+this.userName)
    }

    private incrementInvalidAttempts(): void {
      const obj = this.getUserInfo()
      const attempts = this.getInvalidAttempts() + 1;
      this.storeUserInfo(attempts.toString(),obj?.lockoutKey)
    }

    private getInvalidAttempts(): number {
      const user = this.getUserInfo()
      const attempts = user?.invalid_attempts;
      return attempts ? parseInt(attempts, 10) : 0;
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

    getMessageForConfigByKey(key:string): any{
      let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
        return configObj['settingKey'] === key;
      });
  
      return data[0].keyValueHtml;
    }

    getConfigByKey(key: string): any {
      let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
          return configObj['settingKey'] === key;
      });
      console.log("data", data)
      // Check if data is not empty
      if (data && data.length > 0) {
          return data[0].keyValue;
      }
  
      return null; // Return null if the key is not found
  }


  checkAocStatus() {
    if (this.previousUrl !== '') return; // If the previousUrl is not empty, do nothing.
    this.markLogin();
    this._aocService.getAocStatus().subscribe((res) => {
      const aocBlockerText = this.getMessageForConfigByKey('AOC_POPUP_BLOCKER_TEXT');
      const aocNonBlockerText = this.getMessageForConfigByKey('AOC_POPUP_NON_BLOCKER_TEXT');
  
      // Check if AOC blocker condition is met or user can't continue
      if (res.data.isAocBlocker || (res.data.totalOpenAOCs > 0 && !res.data.canUserContinue)) {
        console.log('first condition');
        
        // Open AOC Modal for blocker
        this._aocService.openAocModal({
          customTitle: 'Open AOCs Notification',
          isCustomTitle: true,
          SubHeading: '',
          icon: 'fa-regular fa-4x fa-light fa-file-text fa-2x',
          Heading: aocBlockerText,
          okBtnText: 'Continue',
          cancelBtnRequired: false,
          cancelBtnText: 'Cancel'
        }).subscribe((result) => {
          if (result) {
            // If modal result is true, navigate to manage AOC
            this._router.navigateByUrl('manage-aoc');
          }
        });
  
      } else if (res.data.totalOpenAOCs > 0 && res.data.canUserContinue) { 
        // Check if there are open AOCs and the user can continue
        this.checkPendingSRF(); // Call checkPendingSRF() function
      } else {
        // If no conditions are met, you may want to log or handle this case
        console.log('No AOC conditions met.');
      }
    });
  }

  markLogin(): void {
    localStorage.setItem('firstBrandsLogin', 'false');
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
            } else {
                this.signOut();
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

    signOut() {
    }

    forgotPassword() {
        this._router.navigateByUrl('/forgotPassword');
    }
    onRedirectToRegister(isDirect = false) {
      if(isDirect) {
        this._cookieService.deleteCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
      }
      this._router.navigateByUrl('/registration');
    }
    
    getDataObject(queryString: string): { [key: string]: string } {
      const queryParams = new URLSearchParams(queryString);
      const paramsObject: { [key: string]: string } = {};
    
      queryParams.forEach((value, key) => {
        paramsObject[key] = value;
      });
      return paramsObject;
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
        this.onLoggedIn.next(true);
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
          if(user && this.isFirstLoad) {
            this.socialAccountVerification(user);
            this._authService.setFirstLoad(false)
          } else {
            this._authService.setFirstLoad(true)
          }
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
        // this.onLoggedIn.next(true);
        // this._alertService.closeAllModals();
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
                if(this.isAocFunctionalityEnabled){
                  this.checkAocStatus();
                } else {
                  this.checkPendingSRF();

                }
                
                this._loginService.setLogin.next(true)
            } else {
                this.signOut();
            }
        })
    }

    closeLoginModal(){
      this.onLoggedIn.next(true);
    }
}