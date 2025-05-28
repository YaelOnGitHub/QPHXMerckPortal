import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAocComponent } from './manage-aoc.component';

describe('ManageAocComponent', () => {
  let component: ManageAocComponent;
  let fixture: ComponentFixture<ManageAocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
