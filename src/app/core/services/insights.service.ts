import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from 'src/environments/environment';
 
@Injectable()
export class Insights {
    private angularPlugin = new AngularPlugin();
    private appInsights = new ApplicationInsights({
        config: {
            instrumentationKey: environment.instrumentationKey,
            extensions: [<any>this.angularPlugin],
            extensionConfig: {
                [this.angularPlugin.identifier]: {
                    router: this.router,
                    errorServices: [new ErrorHandler()],
                },
            },
            isCookieUseDisabled : true,
            disableCookiesUsage: true
        },
    });
 
    constructor(private router: Router) {
        this.appInsights.loadAppInsights();
        this.trackEvent()
        this.trackPage()
    }
 

    trackEvent() {
      const metricName = 'responseTime';
      const metricValue = 100;
      this.appInsights.trackMetric({ name: metricName, average: metricValue })
    }

    // expose methods that can be used in components and services
    trackPage(): void {
        this.appInsights.trackPageView()
    }
 
    trackTrace(message: string): void {
        this.appInsights.trackTrace({ message });
    }
}