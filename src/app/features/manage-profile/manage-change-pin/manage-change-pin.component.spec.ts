import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChangePinComponent } from './manage-change-pin.component';

describe('ManageChangePinComponent', () => {
  let component: ManageChangePinComponent;
  let fixture: ComponentFixture<ManageChangePinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageChangePinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageChangePinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
