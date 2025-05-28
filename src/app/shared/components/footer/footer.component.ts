import { Component, Input, OnInit } from '@angular/core';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common-service/common.service';
 
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  isFooterShow: boolean = true;
  isMerck : boolean = false;
  isQphma : boolean = false;
  isQthera : boolean = false;

  constructor(private _authService: AuthService, private router: Router,
    private _commonService: CommonService
  ) {
    const configList = this._authService.getUserConfiguration();
    this.isMerck = configList[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID ? true : false;
    this.isQphma = configList[0].clientId === APP_CLIENTS.QPharmaRx.CLIENT_ID ? true : false
    this.isQthera = configList[0].clientId === APP_CLIENTS.Qthera.CLIENT_ID ? true : false
  }
  @Input() logo: string = 'qpharmaRx';
  ngOnInit(): void {
  
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }


  redirectToRoute() {
    
    if(!this._authService.isAuthorized(this._authService.getUserSession())) {
      this.router.navigate(['/']);
      return
    }
    
    this._commonService.redirectActivatedRoute()

  }
}
