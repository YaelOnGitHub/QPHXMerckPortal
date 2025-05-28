import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from 'src/app/core/models/user-session.model';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
})
export class SetPasswordComponent {
  constructor(private _router: Router, private _authService: AuthService) {
    const userSession: UserSession = this._authService.getUserSession();
    if (userSession.userAccount['displayChangePasswordScreen'] == 'Y') {
      this._router.navigateByUrl('/security/set-password');
    } else {
      this._router.navigateByUrl('/security/set-questions');
    }
  }

  headerData =
    '<p>Please enter your new password and then re-enter your new password to confirm before submitting.</p><div class="row intro-list"><div class="col-sm-12 col-lg-4"><p>It is further recommended your password not be the same as your user name.  </p></div><div class="col-sm-12 col-lg-4" ><p>The new password that is entered must not have been used as the last 3 passwords. </p></div><div class="col-sm-12 col-lg-4"><p>For assistance or questions, see the help desk information at the bottom of the page.</p></div></div>';

  submitSuccess: boolean = false;

}
