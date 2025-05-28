import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Faq } from 'src/app/core/models/faq.model';
import { HeaderFooterSidebarSettingService } from 'src/app/shared/services/header-footer-sidebar-service/header-footer-sidebar-setting.service';
import { LoaderService } from 'src/app/shared/services/loader-service/loader.service';
import { FaqService } from './faq.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { APP_CLIENTS } from 'src/app/core/services/client-specification.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  
  faqData: Faq[];
  isMerck: boolean = false;
  groupFaqByCategory: { category: string, faqs: Faq[] }[] = [];
  apiDataLoaded: boolean = false
  constructor(private _hfs: HeaderFooterSidebarSettingService, private _faqService: FaqService,private _authService:AuthService, private _location: Location, private _loader: LoaderService) { 
    this._loader.show(null)
  }

  ngOnInit(): void {
    this._hfs.hfsSetting.next({ isHeader: true, isAuthHeader: false, isFooter: true });
    let configList = this._authService.getUserConfiguration();
    if(configList && configList[0].clientId === APP_CLIENTS.MerckQPharmaRx.CLIENT_ID) {
      this.isMerck = true;
    }
    this.getFaq()
  }

  redirectBack() {
    this._location.back()
  }

  getFaq() {
    this._faqService.getFaq().subscribe((faqDetails) => {
    this.faqData = faqDetails.data.faq as Faq[];
    this.processFaqs();
    this.apiDataLoaded = faqDetails.data.faq.length > 0;
    })
  }

  processFaqs() {
    // Group Faqs by category
    const grouped = this.faqData.reduce((acc, faq) => {
      if (faq.category && faq.category.trim()) {
        if (acc[faq.category]) {
          acc[faq.category].faqs.push(faq);
        } else {
          acc[faq.category] = { category: faq.category, faqs: [faq] };
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
  }));

  this.groupFaqByCategory = customOrderedCategories;
}

  
}


