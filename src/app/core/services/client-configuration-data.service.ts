import { Injectable } from '@angular/core';
import { StorageType } from '../../shared/enums/storage-type';
import { SessionService } from './../../shared/services/session.service';

@Injectable({
  providedIn: 'root'
})
export class ClientConfigurationDataService {

  constructor(private sessionService: SessionService) {
  }

  getClientConfigurationData() {
    return this.sessionService.get(
      'clientConfig', StorageType.Session
    );
  }

  
  getConfigurationData(entitlement: string): string {
    const entitlementsFromSession = this.getClientConfigurationData();
    let obj = entitlementsFromSession?.filter(obj => {
      return obj['settingKey'].toLowerCase() == entitlement.toLowerCase()
    });
    return obj ? obj[0]?.keyValueJson : false;
  }
}
