/* eslint-disable prettier/prettier */
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from 'src/app/core/components/page-not-found/page-not-found.component';
import { ContentLayoutModule } from './core/components/content-layout/content-layout.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { UnsavedChangesModalComponent } from './core/components/unsaved-changes-modal/unsaved-changes-modal.component';
import { APP_INITIALIZER } from '@angular/core';
import { JwtModule, JWT_OPTIONS } from "@auth0/angular-jwt";
import { tap } from 'rxjs';
import { AppInitService } from './core/services/app-init.service';
import { SessionService } from './shared/services/session.service';
import { AuthService } from './shared/services/auth-service/auth.service';
import { LoaderComponent } from './core/components/loader/loader.component';
import { LoaderService } from './shared/services/loader-service/loader.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { OneTrustModule } from '@altack/ngx-onetrust';
import { environment } from 'src/environments/environment';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import { CommonService } from './shared/services/common-service/common.service';
import { AocModalComponent } from './features/aoc/aoc-modal/aoc-modal.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    UnsavedChangesModalComponent,
    LoaderComponent,
    AocModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    ContentLayoutModule,
    OneTrustModule.forRoot({
      cookiesGroups: {
        StrictlyNecessaryCookies: 'C0001',
        PerformanceCookies: 'C0002',
        FunctionalCookies: 'C0003',
        TargetingCookies: 'C0004',
        SocialMediaCookies: 'C0005'
      },
      domainScript: environment.merckCookieKey,
    }),

    NgIdleKeepaliveModule.forRoot(),
    // NgcCookieConsentModule.forRoot({}),
    NgxDaterangepickerMd.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
        //TODO : uncomment after demo to get translatios from s3 bucket
        //  useClass: CustomLoader,
        // deps: [HttpClient],
      }
    }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [AuthService]
      }
    }),
    RouterModule,
    CommonModule
  ],
  providers: [
    AppInitService,
    SessionService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService, SessionService, CommonService],
      multi: true
    },
    LoaderService,
    {
      provide: ErrorHandler,
      useClass: ApplicationinsightsAngularpluginErrorService
    }
  ],
  exports: [LoaderComponent],
  bootstrap: [AppComponent]
})

export class AppModule { }


export function HttpLoaderFactory(handler: HttpBackend): TranslateHttpLoader {
  //used httpBackend to avoid interceptor chain
  const http = new HttpClient(handler);
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initializeApp(appInitService: AppInitService, session: SessionService, common: CommonService) {
  return () => appInitService.init()
    .pipe(tap(data => {
      if (data) {
        session.removeItem("clientConfig");
        session.setItem("clientConfig", data['data'].clientConfiguration);
        common.init()
        console.log(`loaded client config`)
        appInitService.loadCookieScript()
        err => console.log('Http error', err)
      }
    }))
}

export function jwtOptionsFactory(AuthService) {
  return {
    tokenGetter: () => {
      return AuthService.getUserSession()?.accessToken;
    }
  }
}

