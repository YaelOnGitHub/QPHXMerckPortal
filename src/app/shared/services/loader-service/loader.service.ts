import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  isLoading = new Subject<boolean>();
  private apiCounter = 0;

  constructor() {
  }

  show(request: HttpRequest<any>) {
    
    if(request && !request.url.includes('/UserLog/add')){
      this.incrementRequestCounter();
      this.isLoading.next(true);
    }
  }

  hide() {

    this.isLoading.next(false);
  }

  incrementRequestCounter(){
    this.apiCounter += 1;
  }

  decrementRequestCounter(){
    this.apiCounter -= 1;
  }

  hideLoader(request: HttpRequest<any>) {
  
    if(request && !request.url.includes('/UserLog/add')){

      this.decrementRequestCounter();

      console.log(this.apiCounter);
      if(this.apiCounter <= 0) {
        this.apiCounter = 0;
        this.hide();
      }
    }
  }
}
