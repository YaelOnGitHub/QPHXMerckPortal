import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrfDeliveryComponent } from './srf-delivery.component';

describe('SrfDeliveryComponent', () => {
  let component: SrfDeliveryComponent;
  let fixture: ComponentFixture<SrfDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrfDeliveryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrfDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
