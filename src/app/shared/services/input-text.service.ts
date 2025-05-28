/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { InputTextData } from './../models/input-text-data.model';

@Injectable({
  providedIn: 'root'
})

export class InputTextService {

  public inputTextStream: Subject<InputTextData> = new Subject<InputTextData>();
  public inputTextStream$ = this.inputTextStream.asObservable();

  constructor() { }
}
