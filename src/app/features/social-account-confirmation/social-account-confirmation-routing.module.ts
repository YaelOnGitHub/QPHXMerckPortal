import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialAccountConfirmationComponent } from './social-account-confirmation/social-account-confirmation.component';

const routes: Routes = [
{
  path: ':link',
  component: SocialAccountConfirmationComponent
}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialAccountConfirmationRoutingModule { }
