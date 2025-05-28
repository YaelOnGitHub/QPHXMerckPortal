import { TestBed } from '@angular/core/testing';

import { HeaderFooterSidebarSettingService } from './header-footer-sidebar-setting.service';

describe('HeaderFooterSidebarSettingService', () => {
  let service: HeaderFooterSidebarSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderFooterSidebarSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
