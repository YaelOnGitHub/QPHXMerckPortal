import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleDetectorComponent } from './idle-detector.component';

describe('IdleDetectorComponent', () => {
  let component: IdleDetectorComponent;
  let fixture: ComponentFixture<IdleDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdleDetectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdleDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
