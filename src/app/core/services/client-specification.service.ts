/* eslint-disable prettier/prettier */
import { Injectable } from "@angular/core";

export const CLIENTS_LIST = {
    QPharmaRx: 'qpharmarx',
    MerckQPharmaRx: 'merckqpharmarx',
    MerckSamplesCenter: 'mercksamplescenter',
    MerckSamplePortal: 'mercksampleportal',
    DemoQPharmaRx: 'qpharmarxdemo',
    MerckProdCDN: 'd1pinbqqc0hozr',
    Qthera: 'tiportaldemo',
    Qbiot: 'pharmacistportal',
    
}
export const APP_CLIENTS =
{
  QPharmaRx: {
      CLIENT_ID: 'QPHMA',
      PROJECT_ID: 'QPRX',
      NON_AUTH_API_TOKEN: 'UVBITUE6UVBSWA=='
  },
  MerckQPharmaRx: {
      CLIENT_ID: 'MERCK',
      PROJECT_ID: 'HCPTIP',
      NON_AUTH_API_TOKEN: 'TUVSQ0s6SENQVElQ'
  },
  // Added for new domain changes 
  MerckSamplesCenter : {
    CLIENT_ID: 'MERCK',
    PROJECT_ID: 'HCPTIP',
    NON_AUTH_API_TOKEN: 'TUVSQ0s6SENQVElQ'
  },
  MerckSamplePortal : {
    CLIENT_ID: 'MERCK',
    PROJECT_ID: 'HCPTIP',
    NON_AUTH_API_TOKEN: 'TUVSQ0s6SENQVElQ'
  },
  MerckProdCDN : {
    CLIENT_ID: 'MERCK',
    PROJECT_ID: 'HCPTIP',
    NON_AUTH_API_TOKEN: 'TUVSQ0s6SENQVElQ'
  },
  DemoQPharmaRx: {
    CLIENT_ID: 'QPHMA',
    PROJECT_ID: 'QPRX',
    NON_AUTH_API_TOKEN: 'UVBITUE6UVBSWA=='
  },
  Qthera: {
    CLIENT_ID: 'QTHER',
    PROJECT_ID: 'TIPORTAL',
    NON_AUTH_API_TOKEN: 'UVRIRVI6VElQT1JUQUw='
  },
  Qbiot: {
    CLIENT_ID: 'QBIOT',
    PROJECT_ID: 'TIPORTAL',
    NON_AUTH_API_TOKEN: 'UUJJT1Q6VElQT1JUQUw='
  },


}


@Injectable({
    providedIn: "root"
})
export class ClientSpecification {

    CLIENT_ID: string;
    PROJECT_ID: string;
    NON_AUTH_API_TOKEN: string

    setSetting() {
        if (window.location.hostname == 'localhost') {
            this.getClientAndProjectId(CLIENTS_LIST.MerckSamplePortal);
        } else {
            let domainName = window.location.hostname ? window.location?.hostname?.split('.')[0] : null
            domainName = domainName == 'www' ? window.location?.hostname?.split('.')[1] : domainName
            this.getClientAndProjectId(domainName);
        }
    }


    getClientAndProjectId(domainName: string) {
        switch (domainName) {
            case CLIENTS_LIST.QPharmaRx:
                this.CLIENT_ID = APP_CLIENTS.QPharmaRx.CLIENT_ID;
                this.PROJECT_ID = APP_CLIENTS.QPharmaRx.PROJECT_ID;
                this.NON_AUTH_API_TOKEN = APP_CLIENTS.QPharmaRx.NON_AUTH_API_TOKEN;
                break;
            case CLIENTS_LIST.MerckQPharmaRx:
                this.CLIENT_ID = APP_CLIENTS?.MerckQPharmaRx?.CLIENT_ID;
                this.PROJECT_ID = APP_CLIENTS?.MerckQPharmaRx?.PROJECT_ID;
                this.NON_AUTH_API_TOKEN = APP_CLIENTS.MerckQPharmaRx.NON_AUTH_API_TOKEN;
                break;
            case CLIENTS_LIST.MerckSamplePortal:
                  this.CLIENT_ID = APP_CLIENTS.MerckSamplePortal.CLIENT_ID;
                  this.PROJECT_ID = APP_CLIENTS.MerckSamplePortal.PROJECT_ID;
                  this.NON_AUTH_API_TOKEN = APP_CLIENTS.MerckSamplePortal.NON_AUTH_API_TOKEN;
                  break;    
            case CLIENTS_LIST.MerckSamplesCenter:
                  this.CLIENT_ID = APP_CLIENTS.MerckSamplesCenter.CLIENT_ID;
                  this.PROJECT_ID = APP_CLIENTS.MerckSamplesCenter.PROJECT_ID;
                  this.NON_AUTH_API_TOKEN = APP_CLIENTS.MerckSamplesCenter.NON_AUTH_API_TOKEN;
                  break;
            case CLIENTS_LIST.MerckProdCDN:
                  this.CLIENT_ID = APP_CLIENTS.MerckProdCDN.CLIENT_ID;
                  this.PROJECT_ID = APP_CLIENTS.MerckProdCDN.PROJECT_ID;
                  this.NON_AUTH_API_TOKEN = APP_CLIENTS.MerckProdCDN.NON_AUTH_API_TOKEN;
                  break;      
            case CLIENTS_LIST.DemoQPharmaRx:
                this.CLIENT_ID = APP_CLIENTS.DemoQPharmaRx.CLIENT_ID;
                this.PROJECT_ID = APP_CLIENTS.DemoQPharmaRx.PROJECT_ID;
                this.NON_AUTH_API_TOKEN = APP_CLIENTS.DemoQPharmaRx.NON_AUTH_API_TOKEN;
                break;        
            case CLIENTS_LIST.Qthera:
                    this.CLIENT_ID = APP_CLIENTS.Qthera.CLIENT_ID;
                    this.PROJECT_ID = APP_CLIENTS.Qthera.PROJECT_ID;
                    this.NON_AUTH_API_TOKEN = APP_CLIENTS.Qthera.NON_AUTH_API_TOKEN;
                    break; 
            case CLIENTS_LIST.Qbiot:
                    this.CLIENT_ID = APP_CLIENTS.Qbiot.CLIENT_ID;
                    this.PROJECT_ID = APP_CLIENTS.Qbiot.PROJECT_ID;
                    this.NON_AUTH_API_TOKEN = APP_CLIENTS.Qbiot.NON_AUTH_API_TOKEN;
                    break; 
            default:
                break;
        }
    }

    getSetting(): any {
        return {
            CLIENT_ID: this.CLIENT_ID,
            PROJECT_ID: this.PROJECT_ID,
            NON_AUTH_API_TOKEN: this.NON_AUTH_API_TOKEN
        }
    }
}