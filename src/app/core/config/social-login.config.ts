
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  GoogleInitOptions,
} from '@abacritt/angularx-social-login';
import { environment } from 'src/environments/environment';

const fbLoginOptions = {
  scope: '',
  return_scopes: true,
  enable_profile_selector: true
};

const googleLoginOptions: GoogleInitOptions = {
  oneTapEnabled: false,  
};

export const socialClientIdConfig = [
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.socialLoginEndpoint.googleClientId, googleLoginOptions)
  },
  // {
  //   id: FacebookLoginProvider.PROVIDER_ID,
  //   provider: new FacebookLoginProvider("Facebook-App-Id", fbLoginOptions)
  // }
];


export const appleSocialIdConfig = {
  CLIENT_ID: environment.socialLoginEndpoint.appleClientId,
  REDIRECT_URL: environment.socialLoginEndpoint.appleRedirectUrl,
  APPLE_END_URL: environment.socialLoginEndpoint.appleEndURL
}