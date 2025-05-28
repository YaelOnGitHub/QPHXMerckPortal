/* eslint-disable prettier/prettier */
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { cartManagementService } from 'src/app/shared/services/cart-management-service/cart-management-service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';

@Component({
    selector: 'app-profile-management',
    templateUrl: './profile-management.component.html',
    styleUrls: ['./profile-management.component.scss']
})

export class ProfileManagementComponent {
    profileManagementFormGroup = new FormGroup({}, { updateOn: 'change' });
    // Profile Image commented for Future Use 
    // profileImg: string = null;

    accountDetails = {
        firstName: '',
        lastName: '',
        email: '',
        designation: ''
    };
    isSocialMediaEnable: boolean = false;
    isSocialLogin: boolean = false;
    socialLoginType: '';

    constructor(private _authService: AuthService, private _commonService: CommonService, private _alertService: AlertService,
      private _cartManagmentService: cartManagementService) {
    }

    onUpdateProfile() {
      const userAccount = this._authService.getUserSession()?.userAccount
      if(userAccount) {
        this.accountDetails.firstName = userAccount?.firstName;
        this.accountDetails.lastName = userAccount?.lastName;
        this.accountDetails.email = userAccount?.email;
        this.accountDetails.designation = userAccount?.designation
      }
    }

    deactivateAccount() {
      this._alertService.confirm({ customTitle: 'Deactivate Account',extraText : 'Are you sure you want to deactivate the account?', 
      textAligment: true,isCustomTitle: true, Heading: '', icon: '', SubHeading: '', isRequiredCancelBtn: true, isRequiredOkBtn: true, okBtnText: 'Ok' }).subscribe((resp)=> {
        if(resp) {
          this._authService.deactivateAccount(this.accountDetails?.firstName,this.accountDetails?.lastName,this.accountDetails?.designation).subscribe((res: any) => {
            if(res.data.isDeleted) {
              this._authService.endSession();
              this._cartManagmentService.clearProductStore()
            }
          })
        }
      })
    }

    // Profile Image Commented for Future Use 
    // onUploadProfileImage(imageInput: any) {
    //     const file: File = imageInput?.files[0];
    //     const reader = new FileReader();
    //     reader.addEventListener('load', (event: any) => {
    //         // API service 
    //         this.profileImg = event?.target?.result
    //     });

    //     reader.readAsDataURL(file);
    // }

    onProfileSave() {
        // API service
    }

    ngOnInit(): void {
        this.profileManagementFormGroup.addControl('fullName', new FormControl(null, [Validators.required]));
        this.profileManagementFormGroup.addControl('email', new FormControl(null, [Validators.required]));
        this.profileManagementFormGroup.addControl('designation', new FormControl(null, [Validators.required]));
        this.isSocialMediaEnable = this._commonService.getisSocialMediaEnable()
        const type = this._authService.getSocialMediaLoginInfo()
        this.socialLoginType = type;
        this.isSocialLogin = type !== 'manual' && type !='' ? true : false
        this.onUpdateProfile();
    };

}

