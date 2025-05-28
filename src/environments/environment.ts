// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiEndpoint: 'https://qprxapi.qpharmasit.com/api',
  mockApiEndpoint: 'https://mockoon.qpharmacorp.com',
  translationApiEndpoint:
    'https://qprx-artifacts.s3.amazonaws.com/DEV/translations',
  version: '2022.7.1',
  socialLoginEndpoint: {
    googleClientId:'177416156494-519hecgc4i0ku89c5lodiv91jdh9eje4.apps.googleusercontent.com',
    googleRedirectUrl: '',
    appleClientId: 'com.qpharma.QPharmaRx.webapp',
    appleRedirectUrl: 'https://devqprxapi.qpharmacorp.com/api/auth-apple-signin',
    appleEndURL: 'https://appleid.apple.com/auth/authorize?',
  },
  reCaptchaSiteKey: '6Lf7Jl8hAAAAAFTZ6GcSf5MoQ08BZcFkQjNm3bX9',
  merckCookieKey: '7fa627c3-9e76-4db9-b2b4-27d0ac770b54-test',
  instrumentationKey: '3f662339-9256-4d0e-896c-fed97ed56164',
  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
