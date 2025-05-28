/* eslint-disable prettier/prettier */
import { Injectable } from "@angular/core";

@Injectable()
export class Constants {
    static USER_SESSION_DATA_KEY = 'userSession';
    static USER_SESSION_CLIENT_CONFIG_KEY = 'clientConfig';
    static HEADER_TYPES = { LoginPageHeader: 'Login-page-Header', registrationPageHeader: "registration-page-Header", dashboardPageHeader: 'dashboard-page-Header' }

    //Patterns
    static emailAddressPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    static onlyNumber = '^[0-9]*$';
    static onlyNumberRegExp = '[^0-9]';
    static phoneNumberPattern = '^[0-9]{3}-[0-9]{3}-[0-9]{4}$';
    static alphanumeric = '^[a-z0-9]+$';

    //translations
    static languagesArray = ["en", "fr"];
    static defaultLanguage = "en";

    static HCP_SEARCH_TYPE = { SEARCH_WITH_NPI: 1, SEARCH_WITH_LICENSE: 2 }
    static INTERCEPTOR_SKIP_HEADER = 'X-Skip-Interceptor';

    static defaultTheme = 'default';

    static producTypeCode = {
        Rx: 1301,
        Promotional: 1305,
        OTC: 1302,
        ControlledSubstance: 1303
    }

    static SOCIAL_MEDIA_COOKIE_KEY = 'j7kl12DfGhTzab56Pq8s9x4EUV0MnCWX';


}

