/* eslint-disable prettier/prettier */
import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { cartManagementService } from '../../services/cart-management-service/cart-management-service';
import { AlertService } from '../alert/alert.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/features/login/login.service';
import { CommonService } from '../../services/common-service/common.service';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { CookieManagementService } from '../../services/cookie-management.service';
import { Constants } from 'src/app/core/utilities/constants';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { LoginComponent } from 'src/app/features/login/login.component';
import { appleSocialIdConfig } from 'src/app/core/config/social-login.config';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppleAccountVerificationRequest, AuthRequest, SocialAccountVerificationRequest, SocialAccountVerificationResponse, SocialLoginRequest } from 'src/app/core/models/auth.model';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { SrfLinkService } from 'src/app/features/srf-link/srf-link.service';
import { ToastrService } from 'ngx-toastr';
import { SocialAccountConfirmationService } from 'src/app/features/social-account-confirmation/social-account-confirmation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(public _showLoginModalRef: BsModalRef, private _modalService: BsModalService,
              private _authService: AuthService,  private _alertService: AlertService, 
              private _cartManagementService: cartManagementService, private router: Router,
              private _loginService:LoginService, private _jwtService: JwtHelperService,
              private _commonService: CommonService, private _socialAuthService: SocialAuthService,
              private _entitlement: EntitlementService, private _srfLinkService: SrfLinkService,
              private _cookieService: CookieManagementService, private _toastr: ToastrService,
              private _router: Router, private _socialAccountService: SocialAccountConfirmationService
) {
  const configList = this._authService.getUserConfiguration();
  const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
  this.isAocEnabled = aocFunctionality?.keyValue.toLowerCase() === 'true';
}

  @Input() logo: string = 'qpharmaRx';
  @Input() authHeader?: boolean = false;
  userName: string;
  userNameInitial: string;
  clientID = '';
  cartProductCont: number = null;
  isMerck: boolean = false;
  isQphma: boolean = false;
  get isLandingPage(): any {
    return this._authService.isLandingPage;
  }
  get isLoginPage(): any {
    return this._authService.isLoginPage;
  }
  productList:any;
  showLoginModalSub: Subscription;
  subscription1$: Subscription;
  previousUrl: string;
  isAocEnabled: boolean = false;

  getUserAccountDetails() {
    this._authService.userSessionStream$.subscribe((accountDetails) => {
      if (accountDetails?.userAccount) {
        this.userName = accountDetails.userAccount['firstName'] + ' ' + accountDetails.userAccount['lastName'];
        this.userNameInitial = accountDetails.userAccount['firstName']?.charAt(0) + accountDetails.userAccount['lastName']?.charAt(0);
      }
    });
  }

  getInitials(fullName) {
    const nameArr = fullName.split(' ');
    return nameArr[0]?.charAt(0) + nameArr[1]?.charAt(0);
  }

  onAppLogOut() {
    this._alertService.confirm({ customTitle: 'Logout', isCustomTitle: true, Heading: 'Are you sure you want to logout?', icon: 'fa-light fa-arrow-right-from-bracket fa-2x', SubHeading: '', isRequiredCancelBtn: true, isRequiredOkBtn: true, okBtnText: 'Logout', cancelBtnText: 'Cancel' }).subscribe((result) => {
      if (result) {
        this._authService.endSession();
        this._cartManagementService.clearProductStore()
        this._loginService.setLogin.next(false)
        this.saveUserActivity(null, "LogOut")

      }
    })
  }


  
  ngOnInit(): void {
    this.getUserAccountDetails();
    this._cartManagementService.getSelectedProductItems().subscribe((productItem) => {
      this.productList = productItem;
      this.cartProductCont = this._cartManagementService.getSelectedItemQuantity(productItem);
    });

    const configList = this._authService.getUserConfiguration();
    this.clientID = configList[0]?.clientId;
    this.isMerck = this.clientID === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false;
    this.isQphma = this.clientID === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false;
    if(!this.isLandingPage){
      this.onGoogleAuthState();
    }
    
    
  }

  handleClick() {
    if (this.cartProductCont > 0) {
      this.saveUserActivity(this.productList, "CartClick");
        // Redirect the user to the /order history route
       this.router.navigate(['/request']);
       return
    }
    let msg = this._entitlement.hasKeyValueHTML('EMPTY_CART_MESSAGE_TXT') ?? 'You have not selected any products. Please ensure at least one product is selected before proceeding with your request.';
    this._alertService.confirm({ customTitle: 'No Products Selected',extraText : msg, textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: false, isRequiredOkBtn: true, okBtnText: 'OK' });
  }

  saveUserActivity(data:any, action: string) {
    let activityMetadata = "NA";
    if(data){
      activityMetadata = JSON.stringify({productList:data});
    }
    
    // Define the activity log structure
    const activityLog = {
      activityMetaData:activityMetadata,
      action: action
    };
  
    // Send the activity log to the server
    this._commonService.addUserActivity(activityLog).subscribe({
      next: response => {
        console.log('User activity logged successfully', response);
      },
      error: error => {
        console.error('Error logging user activity', error);
      },
      complete: () => {
        console.log('User activity logging complete');
      }
    });
    
  }

  redirectToRoute() {
    
    if(!this._authService.isAuthorized(this._authService.getUserSession())) {
      this.router.navigate(['/']);
      return
    }
    
    this._commonService.redirectActivatedRoute()

  }

  login() {

    let userSession = this._authService.getUserSession();
    if (this._authService.isAuthorized(userSession)) {
      this._commonService.redirectActivatedRoute()
    }
    else{
      this.showLogin();

    }
  
  }

  // showNonAuthPageForQpharmaRx(){
  //   let res = this.showNonAuthPageForQpharmaRx1();
  //   console.log(res);
  //   return res;
  // }
  showNonAuthPageForQpharmaRx(){

    let nonAuthPage:string[] = ["/about-us","/data-privacy","/help"];

    if(!this.isQphma){
      return false;
    }

    if(!this.isLandingPage && !nonAuthPage.includes(this.router.url)){
      return false;
    }

    return true;

  }


  showLoginButton(){


    if(!this.isQphma){
      return false;
    }

    if(this.isLandingPage){
      return false;
    }

    return true;

  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  showLogin() {
    let initialState = {
        data: {},
        isPopUp: true,
        backdrop:"dynamic"
    }
    this._showLoginModalRef =
      this._modalService.show(LoginComponent, { initialState, ignoreBackdropClick: false, class: 'custom-modal'});
      
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

  onGoogleAuthState() {
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

  socialAccountVerification(user: SocialUser) {
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

  socialLogin(user , reponseData: SocialAccountVerificationResponse) {
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
            this._modalService.hide();
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
              this._loginService.setLogin.next(true)
          } 
      })
  }

  showCookiePreferences() {
    if (window.Optanon && window.Optanon.ToggleInfoDisplay) {
      window.Optanon.ToggleInfoDisplay();
    } else {
      console.error('OneTrust SDK not initialized.');
    }
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


  onRedirectToRegister(isDirect = false) {
    if(isDirect) {
      this._cookieService.deleteCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    }
    this._router.navigateByUrl('/registration');
  }

} 
