import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSecurityComponent } from './manage-security.component';

describe('ManageSecurityComponent', () => {
  let component: ManageSecurityComponent;
  let fixture: ComponentFixture<ManageSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageSecurityComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
