import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrfLinkConfirmationComponent } from './srf-link-confirmation.component';

describe('SrfLinkConfirmationComponent', () => {
  let component: SrfLinkConfirmationComponent;
  let fixture: ComponentFixture<SrfLinkConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrfLinkConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrfLinkConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
