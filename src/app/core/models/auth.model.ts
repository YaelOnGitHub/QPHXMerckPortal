import { API_Response } from "./common.model";

export interface AuthRequest {
    username: string,
    password: string
    Source: string
}


export interface AuthResponse extends API_Response {
    data: {
        accessToken: string,
        refreshToken: string,
        expiresIn: Date,
        createdAt: string,
        tokenType: string
    }
}

export interface RefreshToken {
    refreshToken: string,
    LoginType?: string
}

export interface UserAccount extends API_Response {
    data: {
        UserDetails
    }
}


export interface UserDetails {
    designation: string;
    firstName: string,
    lastName: string,
    loginId: string,
    securityQuestionId: string,
    email: string,
    role: string,
    displayChangePasswordScreen: string,
    displaySetPinScreen: string,
    displaySetSecurityQuestionScreen: string

}

export interface SocialAccountVerificationRequest {
    idToken: string,
    provider: string,
    platform: string
}

export interface AppleAccountVerificationRequest {
  idToken: string,
  provider: string,
  platform: string,
  FirstName?: string,
  LastName?: string,
}

export interface SocialAccountVerificationResponse extends API_Response {
    data: {
        isRegistrated: boolean,
        accountStatus: string,
        authenticationCode: string
    }    
}

export interface SocialLoginRequest {
    email: string,
    socialId: string,
    authenticationCode: string,
    provider: string
}
export interface SocialLoginResponse extends API_Response {
    data: {
        accessToken: string,
        refreshToken: string,
        expiresIn: Date,
        createdAt: string,
        tokenType: string
    }  
}

export interface SocialVerifyLinkResponse extends API_Response {
    data: {
        isVerified: boolean,
        accountStatus: string,
        verificationMessage: string
    }    
}