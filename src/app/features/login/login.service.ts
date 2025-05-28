/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})


export class LoginService {
  public setLogin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public setLogin$ = this.setLogin.asObservable();

}
