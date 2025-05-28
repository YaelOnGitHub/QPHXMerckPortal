/* eslint-disable prettier/prettier */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable prettier/prettier */
import { AfterViewInit, Component, ElementRef, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-intro-header',
  templateUrl: './intro-header.component.html',
  styleUrls: ['./intro-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IntroHeaderComponent implements AfterViewInit {
  @ViewChild('introData') introData: ElementRef<HTMLElement>;
  constructor() { }

  @Input() headerData: any;
  @Input() withBorder: boolean = false;
  isViewToggle: boolean = false;
  @Input() heading: string = null;
  @Input() subHeading: string = '';
  @Input() stepsList: any[] = [];
  @Input() icon: string = '';
  @Input() iconSize: string = '6.5em'; 
  @Input() contentTemplate: TemplateRef<any>;
  @Input() isWrapper: boolean = true;

  ngAfterViewInit() {
    if (this.headerData !== null) {
      this.introData.nativeElement.insertAdjacentHTML('beforeend', this.headerData);
    }
  }

  onToggle(isViewToggle) {
    this.isViewToggle = !isViewToggle;
  }

}
