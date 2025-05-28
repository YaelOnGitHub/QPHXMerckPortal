import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrfLinkModalComponent } from './srf-link-modal.component';

describe('SrfLinkModalComponent', () => {
  let component: SrfLinkModalComponent;
  let fixture: ComponentFixture<SrfLinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrfLinkModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrfLinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
