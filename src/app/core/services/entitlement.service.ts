/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { StorageType } from '../../shared/enums/storage-type';
import { SessionService } from './../../shared/services/session.service';

@Injectable({
    providedIn: 'root',
})
export class EntitlementService {
    constructor(private sessionService: SessionService) {
    }

    getEntitlements() {
        return this.sessionService.get(
            'clientConfig', StorageType.Session
        );
    }

    hasEntitlementMatch(entitlement: string): boolean {
        const entitlementsFromSession = this.getEntitlements();
        let obj = entitlementsFromSession?.filter(obj => {
            return obj['settingKey'].toLowerCase() == entitlement.toLowerCase()
        });
        const result = obj[0]?.keyValue?.toLowerCase() === "true" ? true : false; 
        return obj ? result : false;
    }

    hasEntitlementMatchForOrderPlace(entitlement: string): string {
        const entitlementsFromSession = this.getEntitlements();
        let obj = entitlementsFromSession?.filter(obj => {
            return obj['settingKey'].toLowerCase() == entitlement.toLowerCase()
        });
        return obj ? obj[0]?.keyValue : false;
    }

    hasKeyValueHTML(entitlement:string) : string {
      const entitlementsFromSession = this.getEntitlements();
      let obj = entitlementsFromSession?.filter(obj => {
          return obj['settingKey'].toLowerCase() == entitlement.toLowerCase()
      });
      return obj ? obj[0]?.keyValueHtml : false;
    }

    keyValueJSON(entitlement: string): string {
        const entitlementsFromSession = this.getEntitlements();
        let obj = entitlementsFromSession?.filter(obj => {
            return obj['settingKey'].toLowerCase() == entitlement.toLowerCase()
        });
        return obj ? (obj[0]?.keyValueJSON || obj[0]?. keyValueJson) : false;
    }
}
