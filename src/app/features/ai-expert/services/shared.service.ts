import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs'; // Import BehaviorSubject and Observable

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  sendSuggest = new Subject<string>();
  sendTextInput = new Subject<string>();

  // Use BehaviorSubject for state that needs an initial value and updates
  private _userName = new BehaviorSubject<string>('Guest');
  // Expose the value as an Observable for components to subscribe to
  userName$: Observable<string> = this._userName.asObservable();

  private _isTyping = new BehaviorSubject<boolean>(false); // Assuming isTyping should be a boolean
  isTyping$: Observable<boolean> = this._isTyping.asObservable();


  constructor() { }

  // Method to update the username
  setUserName(name: string): void {
    this._userName.next(name);
  }

  // Method to update the typing status
  setIsTyping(typing: boolean): void {
      this._isTyping.next(typing);
  }
}