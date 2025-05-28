import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { CommonService } from 'src/app/shared/services/common-service/common.service';


@Injectable()
export class LogHttpInterceptor implements HttpInterceptor {


  constructor(private _httpClient: HttpClient,  
              private _commonService: CommonService,
              private loader: LoaderService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {



    if(!req.url.includes('/UserLog/add')){
       const activityLogData = this.generateRequestData(req);
       this.logRequest(activityLogData);
    }
    
    return next.handle(req);
  }

  private logRequest( activityLog: any) {



    this._commonService.addUserActivity(activityLog).subscribe({
        next: response => {
          console.log('User activity logged successfully', response);
        },
        error: error => {
          console.error('Error logging user activity', error);
        },
        complete: () => {
          //this.loader.hideLoader();
          console.log('User activity logging complete');
        }
      });

      

  }


  private generateRequestData(req: HttpRequest<any>){
    const methodsBodyNotAllowed:string[] = ["ChangePassword","CreatePin","token","ChangePin","SetSecurityQuestion","Login"];

    let [actionName, queryString] = this._commonService.getUrlQueryStringAndActionName(req.url);

    const maskedBody = this.maskSensitiveData(req.body);

    if(actionName == 'SearchRegistration'){
      actionName = this.changeActionName(maskedBody);
    }

    if(actionName == 'token'){
      actionName = "Login";
    }


    let activityMetaData = maskedBody ? JSON.stringify(maskedBody) : queryString;
    if(methodsBodyNotAllowed.includes(actionName)){
      activityMetaData = "NA";
    }


    const activityLogData = {
        activityMetaData: activityMetaData,
        action: actionName
      };

    return activityLogData;
  }

  private maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    let clonedData = JSON.parse(JSON.stringify(data));

    if ('pin' in clonedData) {
        clonedData.pin = '****';
    }

    // Add similar lines here for any other sensitive fields

    return clonedData;
  }

  private changeActionName(data: any): any {
    if (typeof data !== 'object' || data === null) {
        return "SearchRegistration";
    }
    if('npi' in data && data.npi){
      return "SearchRegistrationByNPI";
    }

    if('npi' in data && !data.npi){
      return "SearchRegistrationByLicense";
    }

    return "SearchRegistration";
  }
}
