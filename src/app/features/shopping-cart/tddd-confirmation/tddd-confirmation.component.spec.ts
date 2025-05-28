import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdddConfirmationComponent } from './tddd-confirmation.component';

describe('TdddConfirmationComponent', () => {
  let component: TdddConfirmationComponent;
  let fixture: ComponentFixture<TdddConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdddConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TdddConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
