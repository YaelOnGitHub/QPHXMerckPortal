import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface HeaderFooterSidebar {
  isAuthHeader: boolean,
  isHeader: boolean,
  isFooter?: boolean,
  isSidebar?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class HeaderFooterSidebarSettingService {
  hfsSetting = new BehaviorSubject<HeaderFooterSidebar>({ isAuthHeader: false, isHeader: false, isFooter: false, isSidebar: false });
  hfsSetting$ = this.hfsSetting.asObservable();

  private routerSubscription: Subscription;

  constructor(private router: Router) {
    this.checkRouteSettings(); // Check on initial load
    this.subscribeToRouteChanges(); // Subscribe to future changes
  }

  private checkRouteSettings(): void {
    const currentUrl = this.router.url;
    const currentSettings = this.hfsSetting.getValue();

    // Create a new settings object based on current settings
    const newSettings: HeaderFooterSidebar = { ...currentSettings };

    if (currentUrl.includes('/ai-expert')) {
        // Force header, footer, and sidebar to be visible on AI Expert route
        newSettings.isHeader = true;
        newSettings.isAuthHeader = true;
        newSettings.isFooter = true;
        newSettings.isSidebar = true;
    } else {
        // For other routes, potentially set flags to false or let other logic handle it
        // Assuming default is to hide unless explicitly shown by other logic
        newSettings.isHeader = false;
        newSettings.isAuthHeader = false;
        newSettings.isFooter = false;
        newSettings.isSidebar = false;
        // You might have other logic here that sets these to true for other specific routes
        // This simplified logic assumes AI Expert is the *only* route that needs these forced true here.
    }
     // Only emit if settings have changed to avoid unnecessary updates
     if (JSON.stringify(newSettings) !== JSON.stringify(currentSettings)) {
        this.hfsSetting.next(newSettings);
     }
  }

  private subscribeToRouteChanges(): void {
      this.routerSubscription = this.router.events.pipe(
          filter(event => event instanceof NavigationEnd) // Only react to successful navigation end
      ).subscribe(() => {
          this.checkRouteSettings(); // Check route whenever navigation ends
      });
  }

  // Note: For a service providedIn: 'root', the subscription lives for the app's lifetime,
  // so explicit unsubscription in ngOnDestroy is not strictly necessary unless the
  // provisioning strategy changes or to be absolutely rigorous.

  // Example method to update settings from elsewhere (if needed)
  // public updateSettings(settings: Partial<HeaderFooterSidebar>): void {
  //     const currentSettings = this.hfsSetting.getValue();
  //     const newSettings = { ...currentSettings, ...settings };
  //     // Re-apply AI Expert rule if necessary after other updates
  //     if (this.router.url.includes('/ai-expert')) {
  //          newSettings.isSidebar = true;
  //     }
  //     this.hfsSetting.next(newSettings);
  // }
}
