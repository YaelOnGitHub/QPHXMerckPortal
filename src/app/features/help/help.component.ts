import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Faq } from 'src/app/core/models/faq.model';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { HelpService } from './help.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Fuse from 'fuse.js';
@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  
  faqData: Faq[];
  isMerck: boolean = false;
  groupFaqByCategory: { category: string, faqs: Faq[] }[] = [];
  apiDataLoaded: boolean = false;
  searchTerm: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  fuse: Fuse<Faq>;
  inputValue: string = '';


  constructor(private _hfs: HeaderFooterSidebarSettingService, private _faqService: HelpService,private _authService:AuthService, private _location: Location, private _loader: LoaderService) { 
    this._loader.show(null)
  }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true });
    let configList = this._authService.getUserConfiguration();
    if(configList && configList[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID) {
      this.isMerck = true;
    }
    this.getFaq()
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchText) => {
      this.searchTerm = searchText;
      this.processFaqs();
    });
  }

  redirectBack() {
    this._location.back()
  }

  getFaq() {
    this._faqService.getFaq().subscribe((faqDetails) => {
    this.faqData = faqDetails.data.faq as Faq[];
    this.fuse = new Fuse(this.faqData, {
      keys: ['question', 'answer'],
      threshold: 0.3 // Adjust the threshold as needed for similarity sensitivity
    });
    this.processFaqs();
    this.apiDataLoaded = faqDetails.data.faq.length > 0;
    })
  }

  processFaqs() {
    let filteredFaqs = this.faqData;
    // if (this.searchTerm) {
    //   const result = this.fuse.search(this.searchTerm);
    //   filteredFaqs = result.map(res => res.item);
    // }


    const grouped = filteredFaqs.reduce((acc, faq) => {
      if (faq.category && faq.category.trim()) {
        if (!this.searchTerm || faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          if (acc[faq.category]) {
            acc[faq.category].faqs.push(faq);
          } else {
            acc[faq.category] = { category: faq.category, faqs: [faq] };
          }
        }
      }
      return acc;
    }, {});

    // Convert object to array and sort by category
  const categories = Object.keys(grouped).map((category) => {
    return {
      category,
      faqs: grouped[category].faqs,
    };
  });
  

  const customCategoryOrder = [
    "General",
    "Placing Requests",
    "Automated Requests",
    "User Account and Access"
  ];
  
  // Create a map to store the categories and their corresponding FAQs
  const categoryMap = new Map();
  
  // Populate the map with categories and FAQs
  categories.forEach((item) => {
    categoryMap.set(item.category, item.faqs);
  });
  
  // Create a new array based on the custom category order
  const customOrderedCategories = customCategoryOrder.map((categoryName) => ({
    category: categoryName,
    faqs: categoryMap.get(categoryName),
  })).filter((category) => category.faqs && category.faqs.length > 0);

  this.groupFaqByCategory = customOrderedCategories;
}
onSearch(event: Event) {
  const target = event.target as HTMLInputElement;
  //this.inputValue = target.value;
  this.searchSubject.next(target.value);
}

clearInput() {
  this.inputValue = '';
  this.searchSubject.next("");
}
  
}


