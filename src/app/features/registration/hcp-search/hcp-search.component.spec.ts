import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpSearchComponent } from './hcp-search.component';

describe('HcpSearchComponent', () => {
  let component: HcpSearchComponent;
  let fixture: ComponentFixture<HcpSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcpSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HcpSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
