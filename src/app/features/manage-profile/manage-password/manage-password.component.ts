/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ManageSecurityService } from '../../manage-security/service/manage-security.service';

@Component({
  selector: 'app-manage-password',
  templateUrl: './manage-password.component.html',
  styleUrls: ['./manage-password.component.scss']
})
export class ManagePasswordComponent implements OnInit {
  headerData = '<p>You can manage your password using the relevant options in the menu.</p><div class="row intro-list"><div class="col-sm-12 col-lg-4"><p>It is further recommended your password not be the same as your user name.  </p></div><div class="col-sm-12 col-lg-4" ><p>The new password that is entered must not have been used as the last 3 passwords.  </p></div><div class="col-sm-12 col-lg-4"><p>For assistance or questions, see the help desk information at the bottom of the page.</p></div></div>'
  setPasswordformGroup = new FormGroup({}, { updateOn: 'change' });
  setPasswordSubscripton: Subscription;
   
  constructor(private _fb: FormBuilder, private toastr: ToastrService, private _router: Router, private _manageSecurityService: ManageSecurityService) { }

  
  ngOnInit(): void {
 
  }
}
