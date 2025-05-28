import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDayComponent } from './delivery-day.component';

describe('DeliveryDayComponent', () => {
  let component: DeliveryDayComponent;
  let fixture: ComponentFixture<DeliveryDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
