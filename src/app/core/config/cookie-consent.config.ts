import { NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { EntitlementService } from '../services/entitlement.service';
import { APP_CLIENTS } from '../services/client-specification.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';


export function cookieConsentConfigFactory(_entitlementService: EntitlementService,_authService: AuthService): NgcCookieConsentConfig {
  let configList = _authService.getUserConfiguration();
  if(configList[0].clientId !== APP_CLIENTS.MerckQPharmaRx.CLIENT_ID) {
    return {
      autoOpen: false
    }
  } else {
  return {
    "cookie": {
      "domain": window.location.hostname
    },
    "position": "top",
    "theme": "classic",
    "palette": {
      "popup": {
        "background": "var(--colorWhite)",
        "text": "#696969",
        "link": "var(--colorWhite)"
      },
      "button": {
        "background": "var(--primaryColor)",
        "text": "var(--colorWhite)",
        "border": "transparent"
      }
    },
    "type": "opt-in",
    "content": {
      "message": _entitlementService.hasKeyValueHTML('COOKIE_BANNER_TEXT'),
      'allow': 'Accept All Cookies', 
      "deny": "Customize My Settings",
      "link": "",
      "href": "",
      "policy": "Cookie Policy"
    },
  }
}
}
