/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePinComponent } from '.././manage-security/create-pin/create-pin.component';
import { SetSecurityQuestionsResolver } from './service/set-security-questions-resolver';
import { SetPasswordComponent } from './set-password/set-password.component';
import { SetSecurityComponent } from './set-security/set-security.component';


const routes: Routes = [
  {
    path: '',
    component: SetPasswordComponent,
    data: { displayChangePasswordScreen: 'displayChangePasswordScreen', redirect: 'set-password' },
    // canActivate: [ManageSecurityGuard]
  },
  {
    path: 'set-password',
    component: SetPasswordComponent,
    data: { displayChangePasswordScreen: 'displayChangePasswordScreen', redirect: 'set-password' },
    // canActivate: [ManageSecurityGuard]
  },
  {
    path: 'set-questions',
    component: SetSecurityComponent,
    data: { displaySetSecurityQuestionScreen: 'displaySetSecurityQuestionScreen', redirect: 'set-questions' },
    // canActivate: [ManageSecurityGuard],
    resolve: {
      securityQuestions: SetSecurityQuestionsResolver
    }
  },
  {
    path: 'create-pin',
    component: CreatePinComponent,
    data: {
      displaySetPinScreen: 'displaySetPinScreen',
      redirect: 'create-pin'
    },
    // canActivate: [ManageSecurityGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  // Commented for Future use 
  // providers: [
  //   {
  //     provide: ROUTES,
  //     useFactory: () => {
  //       let routes: Routes = [];
  //       routes.push({
  //         path: 'set-password',
  //         component: SetPasswordComponent,
  //         data: { displayChangePasswordScreen: 'displayChangePasswordScreen', redirect: 'set-questions' }, canActivate: [ManageSecurityGuard]
  //       },);
  //       return [
  //         ...routes,
  //       ];
  //     },
  //     multi: true
  //   }
  // ]
})
export class ManageSecurityRoutingModule { }
