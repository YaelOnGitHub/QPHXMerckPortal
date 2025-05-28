import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from 'src/app/shared/services/session.service';
import {
  HCPList,
  HCPSearchRequest,
} from 'src/app/core/models/registration.model';
import { Constants } from 'src/app/core/utilities/constants';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { RegistrationService } from 'src/app/features/registration/registration.service';
import { Designations, States } from 'src/app/core/models/common.model';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { CookieManagementService } from 'src/app/shared/services/cookie-management.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { StorageType } from 'src/app/shared/enums/storage-type';
import { SocialAuthService } from '@abacritt/angularx-social-login';

const kyes = ['HCP_SEARCH_REGISTRATION_HEADING'];

@Component({
  selector: 'app-hcp-search',
  templateUrl: './hcp-search.component.html',
  styleUrls: ['./hcp-search.component.scss'],
})
export class HcpSearchComponent implements OnInit, OnDestroy {
  formGroup = new FormGroup({}, { updateOn: 'change' });
  headerData: string;
  HCP_SEARCH_BY_NPI_NUMBER: number = Constants.HCP_SEARCH_TYPE.SEARCH_WITH_NPI;
  HCP_SEARCH_BY_STATE_AND_DESIGNATION: number =
    Constants.HCP_SEARCH_TYPE.SEARCH_WITH_LICENSE;
  HCP_SEARCH_BY: number = this.HCP_SEARCH_BY_NPI_NUMBER;
  clientConfig: any;
  licenseStateList: States[] = [];
  designationList: Designations[] = [];
  hcpList: HCPList[] = [];
  hcpSearchParams: HCPSearchRequest = {
    npi: null,
    licenseState: null,
    licenseNumber: null,
    designation: null,
    type: this.HCP_SEARCH_BY,
  };
  isNewRegistrationAllowedByClient: boolean = false;
  isHCPNotFound: boolean = false;
  isMerck:boolean = false;
  isQphma:boolean = false;
  isHCPLoader: boolean = false;
  displayNewRegistrationMsgByClient: boolean;
  displayHCPResultsTitle: boolean = false;
  isAlreadyLogin: boolean = false;
  isNPISearchResult: boolean = false;
  hcpAlreadyRegisteredSubscription: Subscription;
  designationListSubscription: Subscription;
  stateListSubscription: Subscription;
  isSocialMediaEnable: boolean = false
  socialMediaData;
  isSocialLogin: boolean = false;
  refferalRedirect;

  constructor(
    private _registrationService: RegistrationService,
    private _commonService: CommonService,
    private _router: Router,
    private _session: SessionService,
    private _entitlement: EntitlementService,
    private _alertService : AlertService,
    private _authService: AuthService,
    private _cookieService: CookieManagementService,
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

    this.formGroup.addControl(
      'hcpSearchBy',
      new FormControl(this.HCP_SEARCH_BY)
    );
    this.formGroup.addControl(
      'npiNumber',
      new FormControl(null, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(Constants.onlyNumber),
      ])
    );
    this.formGroup.addControl('licenseState', new FormControl(null));
    this.formGroup.addControl(
      'licenseNumber',
      new FormControl(null, [Validators.minLength(3)])
    );
    this.formGroup.addControl('designation', new FormControl(null));
    this.formGroup.addControl('captchaResponse', new FormControl(null,[Validators.required]));

    this.isNewRegistrationAllowedByClient =
      this._entitlement.hasEntitlementMatch('ALLOW_NON_TARGET_REGISTRATION');
    this.displayNewRegistrationMsgByClient =
      this._entitlement.hasEntitlementMatch('DISPLAY_NEW_REGISTRATION_MSG_MODAL');

    this.getSocialMediaInfo()
    this.isMerck = this.clientConfig[0].clientId == APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false; 
    this.isQphma = this.clientConfig[0].clientId == APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false; 

  }

  getSocialMediaInfo() {
    this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable();

    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
      this.socialMediaData = this._cookieService.getCookieFromIOS(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    } else {
      this.socialMediaData = this._cookieService.getCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    }

    this.isSocialLogin = (this.socialMediaData?.provider || '').toLowerCase();
  }

  redirectToLogin() {
    this._authService.setFirstLoad(false);
    
    if(this.isQphma){
      this._socialAuthService.signOut(true).then().catch((err)=>{});
      this._router.navigateByUrl('/');
    }
    else{
      this._router.navigateByUrl('/login');
    }
   
  }

  onEligibilitySearchChange(selectedValue: number) {
    this.HCP_SEARCH_BY = selectedValue;
    this.isAlreadyLogin = false;
    this.displayHCPResultsTitle = false;
    this.clearSearchResult();
    if (selectedValue == this.HCP_SEARCH_BY_STATE_AND_DESIGNATION) {
      this.formGroup.get('npiNumber').clearValidators();

      // this.formGroup.get('captchaResponse').reset();
      this.formGroup.get('npiNumber').reset();

      this.formGroup.get('licenseState').setValidators([Validators.required]);
      this.formGroup
        .get('licenseNumber')
        .setValidators([Validators.required, Validators.minLength(3)]);
      this.formGroup.get('designation').setValidators([Validators.required]);

      this.formGroup.get('npiNumber').updateValueAndValidity();
      this.getDesignationFromConfig();
      this.getStates();
      this.hcpList = [];
    } else {
      this.formGroup
        .get('npiNumber')
        .setValidators([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(Constants.onlyNumber),
        ]);

      this.formGroup.get('licenseState').clearValidators();
      this.formGroup.get('licenseNumber').clearValidators();
      this.formGroup.get('designation').clearValidators();

      this.formGroup.get('licenseState').reset();
      this.formGroup.get('licenseNumber').reset();
      this.formGroup.get('designation').reset();
      // this.formGroup.get('captchaResponse').reset();

      this.formGroup.get('npiNumber').updateValueAndValidity();
      this.hcpList = [];
    }
  }

  resolved(captchaResponse: string) {}

  errored() {}

  getDesignationFromConfig(){

    let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === "DESIGNATIONS";
    });

    this.designationList =  this.transformToDesignation(data[0].keyValue);

    this._session.setItem(
      'designationList',
      this.designationList
    );

  }

  transformToDesignation(keyValue: string): Designations[] {
    return keyValue.split(",").map(abbreviation => {
        return {
            // Assuming a generic description for demonstration
            description: abbreviation,
            abbreviation: abbreviation
        };
    });
  }

  getDesignation() {
    if (this._session.get('designationList')) {
      this.designationList = this._session.get('designationList');
    } else {
      this.designationListSubscription = this._commonService
        .getDesignationList()
        .subscribe(designationResponse => {
          if (designationResponse?.success) {
            this._session.setItem(
              'designationList',
              designationResponse.data.profileDesignations
            );
            this.designationList = designationResponse.data.profileDesignations;
          }
        });
    }
  }

  getStates() {
    if (this._session.get('stateList')) {
      this.licenseStateList = this._session.get('stateList');
    } else {
      this.stateListSubscription = this._commonService
        .getStateList()
        .subscribe(statesResponse => {
          if (statesResponse.success) {
            this._session.setItem('stateList', statesResponse.data.states);
            this.licenseStateList = statesResponse.data.states;
          }
        });
    }
  }

  onNPINumberTypeChanged() {
    let value = this.formGroup.controls['npiNumber'].value;
    let onlyNumberRegExp = new RegExp(Constants.onlyNumberRegExp, 'g');
    let numbers = value.replace(onlyNumberRegExp, '');
    this.formGroup.patchValue({
      npiNumber: numbers,
    });
  }


  showRegistrationPopup(msg,btnText,redirection = false, redirectToLogin = false) {
  this._alertService.confirm({ customTitle: 'Registration',extraText : msg, textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: false, isRequiredOkBtn: true, okBtnText: btnText }).subscribe((result) => {
    if (result) {
        if(redirection && !redirectToLogin) {
          this.onNewRegistrationRedirect()
          return
        }
        if(redirectToLogin) {
          this._router.navigateByUrl(`login`);
        }
    } 
  })
  }

  onSearchHCP(formValues: FormGroup) {
    this.isNPISearchResult = this.formGroup.controls['npiNumber'].value ? true : false;
    this.displayHCPResultsTitle = true;
    this.isAlreadyLogin = false
    this.clearSearchResult();
    this.hcpSearchParams = {
      npi: formValues.value.npiNumber,
      licenseState: formValues.value.licenseState,
      licenseNumber: formValues.value.licenseNumber,
      designation: formValues.value.designation,
      type: this.HCP_SEARCH_BY,
    };

    this.isHCPLoader = true;
    this.hcpAlreadyRegisteredSubscription = this._registrationService
      .searchHCP(this.hcpSearchParams)
      .subscribe(HCPSerchResponse => {
        if (HCPSerchResponse.success) {
          this.hcpList = HCPSerchResponse?.data?.searchResults;
          this.isHCPLoader = false;
          this.isHCPNotFound =
            this.hcpList == null || this.hcpList.length === 0 ? true : false;
          if(this.HCP_SEARCH_BY !== this.HCP_SEARCH_BY_NPI_NUMBER) {
            this.isAlreadyLogin = true
          }  

          this.handleMessagesInPopup();

          this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable();
      
          if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
            this.socialMediaData = this._cookieService.getCookieFromIOS(Constants.SOCIAL_MEDIA_COOKIE_KEY);
          } else {
            this.socialMediaData = this._cookieService.getCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
          }
      
         // const type = (this.socialMediaData?.provider || '').toLowerCase();
          this.isSocialLogin = (this.socialMediaData?.provider || '').toLowerCase();
         // this.isSocialLogin = type === 'google';

          if (
            this.HCP_SEARCH_BY == this.HCP_SEARCH_BY_NPI_NUMBER &&
            this.hcpList?.length > 0
          ) {
            this.onSelectHCP(
              this.hcpList[0]?.hcpId,
              this.hcpList[0]?.isTargetHcp
            );
          }
        } else {
          this.isHCPLoader = false;
        }
      });
  }

  handleMessagesInPopup() {
    if(this.isHCPNotFound && !this.isNewRegistrationAllowedByClient) {
      const msg = this._entitlement.hasKeyValueHTML('REGISTRATION_SEARCH_NOT_FOUND_MESSAGE_TXT_MODAL'); 
      this.showRegistrationPopup(msg,'OK')
    }
    if(this.isHCPNotFound && this.isNewRegistrationAllowedByClient && this.displayNewRegistrationMsgByClient) {
      const msg = this._entitlement.hasKeyValueHTML('NEW_REGISTRATION_MSG_MODAL');
      this.showRegistrationPopup(msg,'Register',true)
    }
  }

  clearSearchResult() {
    this.hcpList = [];
    this.isHCPNotFound = false;
  }

  onSelectHCP(hcpId, isTarget?) {
    // if (isTarget) {
      this._session.setItem('isTargetHCP', isTarget);
      this._registrationService
        .searchHCPByID(hcpId, isTarget)
        .subscribe(res => {
          if (
            res.success &&
            res['apiMessageCode'] ===
              'BAD_REQUEST_HCP_IDENTIFIER_ALREADY_EXISTS'
          ) {
            this.isAlreadyLogin = true
            this.showRegistrationPopup(res.message,'OK', false, true)
            //this._toastr.error(res.message);
          } else {
            this._registrationService.setHCPSearchData(res?.data)
            this._router.navigateByUrl(`registration/${hcpId}?${this.refferalRedirect}`);
          }
        },error => {
          if(this.HCP_SEARCH_BY !== this.HCP_SEARCH_BY_NPI_NUMBER) {
            this.isAlreadyLogin = true
          }
        }
        );
    // }
  } 

  onNewRegistrationRedirect() {
    this._router.navigateByUrl(`registration/new`);
  }

  onBackAction() {

    if(this.isQphma){
      this._router.navigateByUrl('/');
    }
    else{
      this._router.navigateByUrl('/login');
    }
  }

  ngOnDestroy(): void {
    this.hcpAlreadyRegisteredSubscription?.unsubscribe();
    this.designationListSubscription?.unsubscribe();
    this.stateListSubscription?.unsubscribe();
  }
}
