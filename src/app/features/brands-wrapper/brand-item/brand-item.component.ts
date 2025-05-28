import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/shared/services/session.service';

@Component({
  selector: 'app-brand-item',
  templateUrl: './brand-item.component.html',
  styleUrls: ['./brand-item.component.scss']
})
export class BrandItemComponent implements AfterViewInit {
  @ViewChild('boxWarning') boxWarning: ElementRef<HTMLElement>;

  constructor(private _router: Router, private _session : SessionService) { }

  @Input() brand: any;
  isDefaultWarning: boolean = false;
  boxWarningMsg: string = '';
  
  ngAfterViewInit() {
    this.boxWarningMsg = this.brand?.boxWarning !== null ? this.brand?.boxWarning : this.brand?.boxWarningDefault;
    this.isDefaultWarning = this.brand?.boxWarning == null || this.brand?.boxWarning == '' ? true : false; 
    
    if(this.boxWarningMsg) {
      this.boxWarning.nativeElement.insertAdjacentHTML('beforeend', this.boxWarningMsg);
    }
  }

  accessLink(url?: string) {
    let a = document.createElement('a');
    a.target = '_blank';
    a.href = url;
    a.click();
  }

  redirectToProduct(brand) {
    this._session.removeItem("brandWarningBox");
    this._session.removeItem("isDefaultWarning");
    this._session.setItem('brandWarningBox',this.boxWarningMsg)
    this._session.setItem('isDefaultWarning',this.isDefaultWarning)
    this._router.navigate(['/products'], {queryParams : {id : brand?.brandId}})
  }

}
