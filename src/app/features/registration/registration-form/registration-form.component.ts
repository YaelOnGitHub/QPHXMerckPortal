import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { CanComponentDeactivate } from 'src/app/core/guards/deactivate.gaurd';
import { Constants } from 'src/app/core/utilities/constants';
import { License, RegistrationFormModel, Address} from 'src/app/features/registration/registration-form.model';
import { CommonService } from 'src/app/shared/services/common-service/common.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { CommonUtility } from 'src/app/shared/utilities/common.utlities';
import { AddEditAddressModalComponent } from '../add-edit-address/add-edit-address-modal.component';
import { AddEditLicenseModalComponent } from './../../../shared/components/add-edit-license/add-edit-license.component';
import { DeleteLicenseOrAddressModalComponent } from '../delete-license-address/delete-license-address-modal.component';
import { RegistrationService } from '../registration.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
import { Designations, States } from 'src/app/core/models/common.model';
import { ToastrService } from 'ngx-toastr';
import { CookieManagementService } from 'src/app/shared/services/cookie-management.service';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { StorageType } from 'src/app/shared/enums/storage-type';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RegistrationFormComponent
  implements OnInit, CanComponentDeactivate {
  formGroup: FormGroup;
  hcpId: string;
  emailMatch: boolean;
  submissionSubscription: Subscription;
  getHCDetailsByHCPSubscription: Subscription;

  isRegistrationSuccess: boolean = false;
  stateList: States[] = [];
  designationList: Designations[] = [];
  hcpNotFound: boolean = false;
  specialityNotFound: boolean = false;
  designationNoutFound: boolean = false;
  specialityList: [];
  isTarget: boolean;
  headerData;
  displayAddNewLicense: boolean;
  displayAddNewAddress: boolean;
  displayEditAddress: boolean;
  displayDeleteAddress: boolean;
  isSocialMediaEnable: boolean = false;
  isSocialLogin: boolean = false;
  socialLoginType : string;
  socialMediaData;
  HCPFullName: string;
  HCPDesignation: string;
  refferalRedirect:string;

  constructor(
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private _registrationService: RegistrationService,
    private _session: SessionService,
    private _router: Router,
    private _toster: ToastrService,
    public _addEditLicenseModalRef: BsModalRef,
    public _deleteLicenseorAddressModalRef: BsModalRef,
    public _addEditAddressModalRef: BsModalRef,
    public _deleteModalRef: BsModalRef,
    private _modalService: BsModalService,
    private _commonService: CommonService,
    private _alertService:AlertService,
    private _entitlement: EntitlementService,
    private _cookieService: CookieManagementService
  ) {

      // Access the full query string from the current URL
      const queryParams = this.route.snapshot.queryParams;
      // Convert the query parameters object into a query string
      this.refferalRedirect = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&');
          
  }

  ngOnInit() {
    this.isTarget = this._session.get('isTargetHCP') || false;
    // if (this.isTarget === null) {
    //   this._router.navigateByUrl(`registration`);
    // }

    this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable();

    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
      this.socialMediaData = this._cookieService.getCookieFromIOS(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    } else {
      this.socialMediaData = this._cookieService.getCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
    }

    const type = (this.socialMediaData?.provider || '').toLowerCase();
    this.socialLoginType = type;
    this.isSocialLogin = type !== 'manual' && type !='' ? true : false

    this.hcpId = this.route?.snapshot?.paramMap?.get('id');
    this.hcpId === undefined
      ? (this.hcpNotFound = false)
      : (this.hcpNotFound = true);
    this.stateList = this._session.get('stateList');
    this.designationList = this._session.get('designationList');
    this.displayAddNewLicense =
      this._entitlement.hasEntitlementMatch('ALLOW_ADD_LICENSE');
    this.displayAddNewAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_ADD_ADDRESS');
    this.displayEditAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_EDIT_ADDRESS');
    this.displayDeleteAddress =
      this._entitlement.hasEntitlementMatch('ALLOW_DELETE_ADDRESS');

    this.formGroup = this._fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        professionalDesignation: ['', Validators.required],
        speciality: ['', Validators.required],
        npiNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern(Constants.onlyNumber),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(Constants.emailAddressPattern),
          ],
        ],
        confirmEmail: [
          '',
          [Validators.required, CommonUtility.confirmEmailValidator('email')],
        ],
        acceptTermsAndConditions: [null, Validators.required],
        stateLicense: this._fb.array([]),
        address: this._fb.array([]),
      },
      { updateOn: 'blur' }
    );

    this.getDesignationFromConfig();
    this.getStates();
    this.getSpeciality();

    if (this.hcpId) {
      this.getHcpDetails();
    }


  }

  onCheckChange(e) {
    this.formGroup.patchValue({
      acceptTermsAndConditions: e.target.checked,
    });
    this.formGroup.updateValueAndValidity();
  }

  getSpeciality() {
    if (this._session.get('specialityList')) {
      this.specialityList = this._session.get('specialityList');
    } else {
      this._commonService.getSpecialityList().subscribe(specialityRes => {
        if (specialityRes?.success) {
          this._session.setItem(
            'specialityList',
            specialityRes.data.specialtyCodes
          );
          this.specialityList = specialityRes.data.specialtyCodes;
        }
      });
    }
  }

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
      this._commonService
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
      this.stateList = this._session.get('stateList');
    } else {
      this._commonService.getStateList().subscribe(statesResponse => {
        if (statesResponse.success) {
          this._session.setItem('stateList', statesResponse.data.states);
          this.stateList = statesResponse.data.states;
        }
      });
    }
  }

  getLicenseControlByName(
    groupIndex: number,
    controlName: string
  ): FormControl {
    const fg = this.stateLicense.at(groupIndex) as FormGroup;
    return fg.get(controlName) as FormControl;
  }
  getAddressControlByName(
    groupIndex: number,
    controlName: string
  ): FormControl {
    const fg = this.address.at(groupIndex) as FormGroup;
    return fg.get(controlName) as FormControl;
  }

  mapFormFieldsForInit(data: RegistrationFormModel) {
    this.formGroup.patchValue({
      firstName: data?.firstName,
      lastName: data?.lastName,
      middleName: data?.middleName,
      professionalDesignation: data?.profDesignation,
      speciality: data?.specialty || this.specialityList,
      npiNumber: data?.npiNumber,
      email: this.socialMediaData?.email,
      confirmEmail: this.socialMediaData?.email
    });

    this.specialityNotFound = data?.specialty ? false : true;
    this.designationNoutFound = data?.profDesignation ? false : true;

    this.HCPFullName = data?.firstName + ' ' + data?.lastName;
    this.HCPDesignation = data?.profDesignation;

    this.mapStateLicense(data?.licenses);
    this.mapAddress(data?.addresses);
  }

  getHcpDetails() {
    const data = this._registrationService.getHCPSearchData()
    if(data !== undefined) {
      this.hcpNotFound = false;
      this.mapFormFieldsForInit(data.hcpDetails);
      return
    } 

    this.getHCDetailsByHCPSubscription = this._registrationService
      .searchHCPByID(this.hcpId, this.isTarget)
      .subscribe(HCPDetailsResponse => {
        if (HCPDetailsResponse.success) {
          this.hcpNotFound = false;
          this.mapFormFieldsForInit(HCPDetailsResponse.data.hcpDetails);
        } else {
          this._toster.success(HCPDetailsResponse.message);
        }
      });
  }

  get stateLicense(): FormArray {
    return this.formGroup.get('stateLicense') as FormArray;
  }

  get address(): FormArray {
    return this.formGroup.get('address') as FormArray;
  }

  resolveStates() {
    let res = this.stateList?.filter(el => {
      return !this.stateLicense?.value?.find(element => {
      return element.licenseState === el.stateCode 
      })
    });
    return res;
  }

  addEditStateLicense(isEdit, control) {
    let initialState = {
      isEdit: isEdit,
      data: control,
      stateList: this.resolveStates(),
      isSubmitAddLicense: false,
    };

    if (!isEdit) {
      this._addEditLicenseModalRef = this._modalService.show(
        AddEditLicenseModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        }
      );

      this._modalService.onHide.pipe(take(1)).subscribe(res => {
        if (this._addEditLicenseModalRef?.content?.isAddLicenseTouched) {
          this.mapStateLicense(this._addEditLicenseModalRef?.content?.formData);
        }
      });
    } else {
      this._addEditLicenseModalRef = this._modalService.show(
        AddEditLicenseModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        }
      );

      this._modalService.onHide.pipe(take(1)).subscribe(res => {
        if (this._addEditLicenseModalRef?.content?.isAddLicenseTouched) {
          control.patchValue({
            licenseState:
              this._addEditLicenseModalRef?.content?.formData?.licenseState,
            licenseNumber:
              this._addEditLicenseModalRef?.content?.formData?.licenseNumber,
          });
        }
      });
    }
  }

  deleteStateLicenseOrAddress(entityType, data: FormGroup, index) {

    if (entityType === 'license') {
      let initialState = {
        label: 'Are you sure you want to delete License #',
        data: data,
        entityType: entityType,
      };
      this._deleteLicenseorAddressModalRef = this._modalService.show(
        DeleteLicenseOrAddressModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        }
      );
    } else if (entityType === 'address') {
      if (data.value.deaNum !== null && data.value.deaNum !== undefined) 
      {
          this._alertService
          .warning({              
              isCustomTitle: true,
              customTitle: 'Address Deletion Restricted',
              Heading: '',
              SubHeading: '',
              okBtnText: 'OK',
              isRequiredOkBtn: true,
              textAligment: true,
              extraText: 'This addresses is associated with a DEA license and hence cannot be deleted.',
              icon: ''
          });            
          return;
      }
      let initialState = {
        label: 'Are you sure you want to delete this Address?',
        data: data,
        entityType: entityType,
        formData: true,
      };
      this._deleteLicenseorAddressModalRef = this._modalService.show(
        DeleteLicenseOrAddressModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        }
      );
    }
    this._modalService.onHide.pipe(take(1)).subscribe(res => {
      if (this._deleteLicenseorAddressModalRef?.content?.deleteContent) {
        entityType === 'license'
          ? this.stateLicense.removeAt(index)
          : this.address.removeAt(index);
      }
    });
  }

  addEditAddress(isEdit, control?) {
    let initialState = {
      isEdit: isEdit,
      data: control,
      isFormData: true,
      isShowPrefferAddress: false,
    };
    if (!isEdit) {
      this._addEditAddressModalRef = this._modalService.show(
        AddEditAddressModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        },
      );
      this._modalService.onHide.pipe(take(1)).subscribe(res => {
        if (this._addEditAddressModalRef?.content?.isAddAddressTouched) {
          this.mapAddress(this._addEditAddressModalRef.content.formData);
        }
      });
    } else {
      this._addEditAddressModalRef = this._modalService.show(
        AddEditAddressModalComponent,
        {
          initialState,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
        }
      );
      this._modalService.onHide.pipe(take(1)).subscribe(res => {
        if (this._addEditAddressModalRef?.content?.isAddAddressTouched) {
          control.patchValue({
            city: this._addEditAddressModalRef?.content?.formData?.city,
            fax: this._addEditAddressModalRef?.content?.formData?.fax,
            phoneNum: this._addEditAddressModalRef?.content?.formData?.phone,
            zipCode: this._addEditAddressModalRef?.content?.formData?.zipCode
              ? this._addEditAddressModalRef?.content?.formData?.zipCode
              : this._addEditAddressModalRef?.content?.formData?.zip,
            state: this._addEditAddressModalRef?.content?.formData?.state,
            deaNum: this._addEditAddressModalRef?.content?.formData?.deaNumber
              ? this._addEditAddressModalRef?.content?.formData?.deaNumber
              : this._addEditAddressModalRef?.content?.formData?.dEA,
            address1: this._addEditAddressModalRef?.content?.formData?.address1,
            address2: this._addEditAddressModalRef?.content?.formData?.address2,
          });
        }
      });
    }
  }

  mapStateLicense(data) {
    if (Array.isArray(data)) {
      data.map(license => {
        const licenseForm = this._fb.group({
          licenseState: license?.licenseState,
          licenseNumber: license?.licenseNumber,
          samplingStatus: license?.samplingStatus,
          licenseStatus: license?.licenseStatus
        });
        this.stateLicense.push(licenseForm);
      });
    } else {
      const licenseForm = this._fb.group({
        licenseState: data?.licenseState,
        licenseNumber: data?.licenseNumber,
        samplingStatus: data?.samplingStatus,
        licenseStatus: data?.licenseStatus
      });
      this.stateLicense.push(licenseForm);
    }
  }

  mapAddress(data) {

    if (Array.isArray(data)) {
      data?.map(address => {
        const addressForm = this._fb.group({
          HCPFullName: this.HCPFullName,
          HCPDesignation: this.HCPDesignation,
          address1: address?.address1,
          address2: address?.address2,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode || address.zip,
          phoneNum: address.phoneNum || address.phone,
          fax: address.fax,
          deaNum: address.deaNum || address.dEA,
          deaStatus: null,
          addressCheckSum: null,
          addressLocId: address?.addressLocId,
        });
        this.address.push(addressForm);
      });
    } else {
      const addressForm = this._fb.group({
        HCPFullName: this.HCPFullName,
        HCPDesignation: this.HCPDesignation,
        address1: data?.address1,
        address2: data?.address2,
        city: data?.city,
        state: data?.state,
        zipCode: data.zipCode || data.zip,
        phoneNum: data.phoneNum || data.phone,
        fax: data?.fax,
        deaNum: data.deaNum || data.dEA,
        deaStatus: null,
        addressCheckSum: null,
        addressLocId: data?.addressLocId
      });
      this.address.push(addressForm);
    }
  }

  mapFormFieldsForSubmission() {
    //needs change for addresses
    let submissionObject: RegistrationFormModel = {
      firstName: this.formGroup?.get('firstName')?.value,
      middleName: '',
      lastName: this.formGroup?.get('lastName')?.value,
      profDesignation: this.formGroup?.get('professionalDesignation')?.value,
      specialty: this.formGroup?.get('speciality')?.value,
      npiNumber: this.formGroup?.get('npiNumber')?.value,
      email: this.formGroup?.get('email')?.value?.toLowerCase(),
      licenses: this.getLicenseInfo(),
      addresses: this.getAddressInfo(),
      source: null,
      hcpIdentifier: this.isTarget ? this.hcpId : '',
      authenticationCode: this.socialMediaData?.authenticationCode
    };
    return submissionObject;
  }

  getLicenseInfo(): License[] {
    const validLicense = [...this.stateLicense.value];
    return validLicense.filter((item: any) => {
      return item.licenseNumber !== null
    })
  }

  getAddressInfo(): Address[] {
    return [...this.address.value];
  }

  getLicneseInfoByAddressState(groupIndex: number,  controlName: string):License{
    let addressState = this.getAddressControlByName(groupIndex, controlName).value?.toUpperCase();
    const validLicense = [...this.stateLicense.value];
    return validLicense.find((item: any) => {
      return item.licenseState == addressState
    });
  }

  onSubmit() {
    let registrationFormObject: RegistrationFormModel =
    this.mapFormFieldsForSubmission();
    this.submissionSubscription = this._registrationService
      .submitRegistration(registrationFormObject)
      .subscribe(registrationResponse => {
        if (
          registrationResponse.success &&
          registrationResponse.data.isRegistrationPlaced
        ) {
          
          // this._cookieService.deleteCookie(Constants.SOCIAL_MEDIA_COOKIE_KEY);
          this.isRegistrationSuccess = true;
          let fullName =
            registrationFormObject?.firstName +
            ' ' +
            registrationFormObject?.lastName;
          this._router.navigateByUrl(`registration/${this.hcpId}/success?name=${fullName}&designation=${registrationFormObject?.profDesignation}&${this.refferalRedirect}`);
        } else {
          this.showRegistrationPopup(registrationResponse.message)
        }
      });
  }

  showRegistrationPopup(msg) {
    this._alertService.confirm({ customTitle: 'Registration',extraText : msg, textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: false, isRequiredOkBtn: true, okBtnText: 'Ok' }).subscribe((result) => {
      if (result) {
      }
    })
  }

  navigate() {
    this._router.navigateByUrl('registration');
  }

  canDeactivate() {
    return (
      this.formGroup.touched &&
      this.formGroup.dirty &&
      !this.isRegistrationSuccess
    );
  }

  ngOnDestroy() {
    if (this.submissionSubscription) {
      this.submissionSubscription?.unsubscribe();
    }
    if (this.getHCDetailsByHCPSubscription) {
      this.getHCDetailsByHCPSubscription?.unsubscribe();
    }
  }
}
