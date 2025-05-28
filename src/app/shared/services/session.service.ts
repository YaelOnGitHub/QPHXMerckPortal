import { Injectable } from '@angular/core';
import {
  SessionStorageService,
  LocalStorageService,
} from 'angular-web-storage';
import { StorageType } from './../enums/storage-type';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(
    private session: SessionStorageService,
    private localSession: LocalStorageService
  ) {}

  get(storageKey: string, storageType: string = StorageType.Session): any {
    return storageType === StorageType.Session
      ? this.session.get(storageKey)
      : this.localSession.get(storageKey);
  }

  setItem(
    storageKey: string,
    storageValue: any,
    storageType: string = StorageType.Session
  ) {
    if (storageKey && storageValue) {
      storageType === StorageType.Session
        ? this.session.set(storageKey, storageValue)
        : this.localSession.set(storageKey, storageValue);
    }

    if(storageKey && typeof storageValue == 'boolean') {
      storageType === StorageType.Session
        ? this.session.set(storageKey, storageValue)
        : this.localSession.set(storageKey, storageValue);
    }
  }

  removeItem(
    storageKey: string,
    storageType: string = StorageType.Session
  ): boolean {
    let result = false;
    if (storageKey) {
      storageType === StorageType.Session
        ? this.session.remove(storageKey)
        : this.localSession.remove(storageKey);
      return true;
    }
    return result;
  }

  popItem(storageKey: string, storageType: string = StorageType.Session): any {
    let result = null;
    let storageValue =
      storageType === StorageType.Session
        ? this.session.get(storageKey)
        : this.localSession.get(storageKey);
    if (storageKey && storageValue) {
      result = storageValue;
      storageType === StorageType.Session
        ? this.session.remove(storageKey)
        : this.localSession.remove(storageKey);
    }
    return result;
  }
}
