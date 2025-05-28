import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSecurityQuestionModalComponent } from './manage-security-question-modal.component';

describe('ManageSecurityQuestionModalComponent', () => {
  let component: ManageSecurityQuestionModalComponent;
  let fixture: ComponentFixture<ManageSecurityQuestionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageSecurityQuestionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSecurityQuestionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
