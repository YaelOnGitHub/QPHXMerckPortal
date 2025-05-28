import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieOptionsModalComponent } from './cookie-options-modal.component';

describe('CookieOptionsModalComponent', () => {
  let component: CookieOptionsModalComponent;
  let fixture: ComponentFixture<CookieOptionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CookieOptionsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
