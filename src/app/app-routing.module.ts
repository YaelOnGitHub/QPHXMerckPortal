/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { AuthChildGuard } from './core/guards/auth-child.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { RegistrationComponent } from './features/registration/registration.component';
import { TranslateModule } from '@ngx-translate/core';
import { ManageSecurityComponent } from './features/manage-security/manage-security.component';
import { DeactivateGuard } from './core/guards/deactivate.gaurd';
import { ProductWrapperComponent } from './features/product-wrapper/product-wrapper.component';
import { ShoppingCartComponent } from './features/shopping-cart/shopping-cart.component';
import { ManageProfileComponent } from './features/manage-profile/manage-profile.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { OrderHistoryComponent } from './features/order-history/order-history.component';
import { FaqComponent } from './features/faq/faq.component';
import { BrandsWrapperComponent } from './features/brands-wrapper/brands-wrapper.component';
import { SocialAccountConfirmationComponent } from './features/social-account-confirmation/social-account-confirmation/social-account-confirmation.component';
import { SrfLinkConfirmationComponent } from './features/srf-link/srf-link-confirmation/srf-link-confirmation.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { HelpComponent } from './features/help/help.component';
import { DataPrivacyComponent } from './features/data-privacy/data-privacy.component';
import { ManageAocComponent } from './features/aoc/manage-aoc/manage-aoc.component';
import { AocBlockerGuard } from './features/brands-wrapper/AocBlocker.guard';
import { AocBlockerGuardFromUi } from './features/aoc/aocBlockerfromUi.guard';
import { AIExpertComponent } from './features/ai-expert/ai-expert.component';

const routes: Routes = [
  {
    path: 'login', component: LoginComponent,
    loadChildren: () =>
      import('./features/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    canDeactivate: [DeactivateGuard],
    loadChildren: () =>
      import('./features/registration/registration.module').then(m => m.RegistrationModule)
  },
  {
    path: '',
    component: LandingPageComponent,
    loadChildren: () =>
      import('./features/landing-page/landing-page.module').then(m => m.LandingPageModule)
  },
  {
    path: 'security',
    component: ManageSecurityComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/manage-security/manage-security.module').then(m => m.ManageSecurityModule)
  },
  {
    path: 'products',
    component: ProductWrapperComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/product-wrapper/product-wrapper.module').then(m => m.ProductWrapperModule)
  },
  {
    path: 'brands',
    component: BrandsWrapperComponent,
    canActivate: [AuthGuard, AocBlockerGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/brands-wrapper/brands-wrapper.module').then(m => m.BrandsWrapperModule)
  },
  {
    path: 'ai-expert',
    component: AIExpertComponent,
    canActivate: [AuthGuard, AocBlockerGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/ai-expert/ai-expert.component.module').then(m => m.AIExpertComponentModule)
  },
  {
    path: 'request',
    component: ShoppingCartComponent,
    canActivate: [AuthGuard, AocBlockerGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/shopping-cart/shopping-cart.module').then(m => m.ShoppingCartModule)
  },  
  {
    path: 'request-history',
    component: OrderHistoryComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/order-history/order-history.module').then(m => m.OrderHistoryModule)
  },
  {
    path: 'faq',
    component: FaqComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    loadChildren: () =>
      import('./features/faq/faq.module').then(m => m.FaqModule)
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    loadChildren: () =>
      import('./features/about-us/about-us.module').then(m => m.AboutUsModule)
  },
  {
    path: 'help',
    component: HelpComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    loadChildren: () =>
      import('./features/help/help.module').then(m => m.HelpModule)
  },
  {
    path: 'data-privacy',
    component: DataPrivacyComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    loadChildren: () =>
      import('./features/data-privacy/data-privacy.module').then(m => m.DataPrivacyModule)
  },
  {
    path: 'social-account-confirmation',
    component: SocialAccountConfirmationComponent,
    loadChildren: () =>
      import('./features/social-account-confirmation/social-account-confirmation.module').then(m => m.SocialAccountConfirmationModule)
  },
  {
    path: 'srf-link',
    component: SrfLinkConfirmationComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/srf-link/srf-link.module').then(m => m.SrfLinkModule)
  },
  {
    path: 'manage-aoc',
    component: ManageAocComponent,
    canActivate: [AuthGuard, AocBlockerGuardFromUi],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/aoc/aoc.module').then(m => m.AocModule)
  },
  {
    path: 'manage',
    component: ManageProfileComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    data: { preload: true, auth: true, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/manage-profile/manage-profile.module').then(m => m.ManageProfileModule)
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent,
    data: { preload: true, auth: false, redirectTo: 'login' },
    loadChildren: () =>
      import('./features/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  { path: 'page-not-found', component: PageNotFoundComponent },
  {
    path: '', redirectTo: 'landing', pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    TranslateModule],
  providers: [DeactivateGuard],
  exports: [RouterModule, TranslateModule]
})
export class AppRoutingModule { }
