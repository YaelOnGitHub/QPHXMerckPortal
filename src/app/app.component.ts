/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { TranslateService } from "@ngx-translate/core";
import { Constants } from './core/utilities/constants';
import { Router, Event, NavigationStart } from '@angular/router';
import { ClientSpecification } from './core/services/client-specification.service';
import { Subscription } from 'rxjs'
import { HeaderFooterSidebarSettingService } from './shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { LoaderService } from './shared/services/loader-service/loader.service';
import { AuthService } from './shared/services/auth-service/auth.service';
import { APP_CLIENTS } from './core/services/client-specification.service';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CookieConsetService } from './core/services/cookie-conset.service';
import { LoginService } from './features/login/login.service';
import { Insights } from './core/services/insights.service';
import { environment } from 'src/environments/environment';
import { ScriptLoaderService } from './core/services/script-loader-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
//qprx-426 commented code for browser zoom and hiding scrollbar
export class AppComponent implements OnInit {
  title = 'qpharmaRx';
  isHeader: boolean = true;
  isAuthHeader: boolean = true;
  isFooter: boolean = true;
  isSidebar: boolean = true;
  isSidebarCollapse: boolean = true;
  hfsSetting: Subscription;
  isLoggedIn: boolean = false;
  isLoading: boolean;
  configList;
  client: string = '';
  clientIcon: string = ''

  clientInfo = {
    'QPHMA' :  {
      'title' : 'QPharmaRx',
      'icon' : 'favicon-Rx.ico'
    },
    'MERCK' : {
      'title': 'Merck Sample Portal',
      'icon' : 'favicon-Merck.ico'
    },
    'GSKUS' : {
      'title' : 'QpharmaRx',
      'icon' : 'favicon-Rx.ico'
    },
    'QTHER' : {
      'title' : 'Q-Thera',
      'icon' : 'favicon-Rx.ico'
    },
    'QBIOT' : {
      'title' : 'Qbiot',
      'icon' : 'favicon-Rx.ico'
    }
  };

  //resizeObservable$: Observable<Event>
 // resizeSubscription$: Subscription

  constructor(private themeService: ThemeService, private _authService: AuthService, private clientSpecification: ClientSpecification,
    private _insightService: Insights, // Added for application insights
    private _loginService:LoginService, 
    private translate: TranslateService, 
    private router: Router, 
    private _hfs: HeaderFooterSidebarSettingService, 
    private _cookieService: CookieConsetService,
    private loader: LoaderService, 
    private scriptLoader: ScriptLoaderService,
    @Inject(DOCUMENT) private _document) {
    this.setAppLogoAndTitle()
    this.translate.addLangs(Constants.languagesArray);
    this.translate.setDefaultLang(Constants.defaultLanguage);
    this.translate.use(Constants.defaultLanguage);
    this.loader.isLoading.subscribe((res) => {
      this.isLoading = res;
    })
    this.checkLandingPage();
    this.checkLoginPage();
  }

  //to be added wherever we are going to provide language change menu option in the app
  switchLang(lang: string) {
    this.translate.use(lang);
  }


  checkLandingPage() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
          this._authService.setIsLandingPage((event.url == "/" || event.url.startsWith("/?ref=") || event.url.startsWith("/?showLogin=")) ? true : false)
      }  
      });
  }

  checkLoginPage() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
       
        const isLoginPage = event.url.includes("/login");
        this._authService.setIsLoginPage(isLoginPage);
      }
    });
  }
  
  setAppLogoAndTitle() {
    this.configList = this._authService.getUserConfiguration();
    const clientId = this.configList[0]?.clientId || APP_CLIENTS.QPharmaRx.CLIENT_ID;
    this.client = this.clientInfo[clientId].title || 'Qpharma';
    this.clientIcon = this.clientInfo[clientId].icon;
    if (clientId) {
      document.getElementsByClassName('title')[0].innerHTML = this.clientInfo[clientId].title;
      this._document.getElementById('appFavicon').setAttribute('href', this.clientInfo[clientId].icon);
    }
  }

  setLoginSettings() {
    this._loginService.setLogin$.subscribe((res) => {
      this.isLoggedIn = res;
    })
  }

  headerFooterSidebarSetting() {
    this.hfsSetting = this._hfs.hfsSetting$.subscribe((hfsSetting) => {
      this.isAuthHeader = hfsSetting.isAuthHeader;
      this.isHeader = hfsSetting.isHeader;
      this.isFooter = hfsSetting.isFooter;
      this.isSidebar = hfsSetting.isSidebar;
    })
  }

  onToggleSidebar(isSidebarCollapse: boolean) {
    this.isSidebarCollapse = !isSidebarCollapse;
  }

  ngOnInit() {
    const selectedTheme = this.configList[0].clientId
    this.themeService.setTheme(selectedTheme);
    this.router.canceledNavigationResolution = 'computed';

    this.clientSpecification.setSetting();
    this.headerFooterSidebarSetting();
    this.setLoginSettings()
    this.loadGtmScript()
    if (environment.production) {
      this.scriptLoader.load('https://track.cbdatatracker.com/Home?v=3&id=06316cbe-76fe-4fe6-b3b8-b627883b59a9', 'clicb')
        .then(() => console.log('Script loaded'))
        .catch(err => console.error('Error loading script', err));

      // Load the Google Analytics external script
      this.scriptLoader.load('https://www.googletagmanager.com/gtag/js?id=G-S182FK8Y3G', 'googleAnalytics')
      .then(() => {
        console.log('Google Analytics script loaded');

        // Assuming you have a method to load inline scripts or you adapt the existing one
        const inlineScriptContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-S182FK8Y3G');
        `;
        this.scriptLoader.loadInlineScript(inlineScriptContent, 'gtagInlineConfig');
         // .then(() => console.log('Google Analytics inline config executed'))
         // .catch(err => console.error('Error executing inline script for Google Analytics', err));
      })
      .catch(err => console.error('Error loading Google Analytics script', err));

    }
    else{


        // Load the Google Analytics external script
        this.scriptLoader.load('https://www.googletagmanager.com/gtag/js?id=G-JTT81JRLVR', 'googleAnalytics')
        .then(() => {
          console.log('Google Analytics script loaded');

          // Assuming you have a method to load inline scripts or you adapt the existing one
          const inlineScriptContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JTT81JRLVR');
          `;
          this.scriptLoader.loadInlineScript(inlineScriptContent, 'gtagInlineConfig');

        })
        .catch(err => console.error('Error loading Google Analytics script', err));

    }
  }

  loadGtmScript(): void {
    const gtmScriptUrl = 'https://www.googletagmanager.com/gtm.js?id=GTM-NCTSN634';
    const gtmScriptId = 'gtm-script';

    this.scriptLoader.load(gtmScriptUrl, gtmScriptId)
      .then(() => {
        console.log('GTM script loaded');

        const inlineScriptContent = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          '${gtmScriptUrl}';f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NCTSN634');
        `;
        this.scriptLoader.loadInlineScript(inlineScriptContent, 'gtm-inline-config');
      })
      .catch(err => console.error('Error loading GTM script', err));
  }
 
  unsubscribe() {
    this.hfsSetting.unsubscribe();
  //  this.resizeSubscription$.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

}
 