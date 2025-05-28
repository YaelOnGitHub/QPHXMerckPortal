/* eslint-disable prettier/prettier */

import { UserAccount, UserDetails } from "./auth.model";

export class UserSession {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  refreshToken: string;
  createdAt: string;
  expires?: Date;
  uniqueSessionId?:string;
  userAccount?: UserDetails

  constructor(userSession?: UserSession) {
    if (!userSession) {
      return;
    }
    this.mapUserSession(userSession);
  }

  private mapUserSession(userSession: UserSession) {
    if (!userSession) {
      return;
    }
    this.accessToken = userSession.accessToken;
    this.expiresIn = userSession.expiresIn;
    this.tokenType = userSession.tokenType;
    this.refreshToken = userSession.refreshToken;
    this.createdAt = userSession.createdAt;
    this.userAccount = userSession.userAccount;
    this.uniqueSessionId = userSession.uniqueSessionId;
  }
}
