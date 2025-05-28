import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AocModalComponent } from './aoc-modal.component';

describe('AocModalComponent', () => {
  let component: AocModalComponent;
  let fixture: ComponentFixture<AocModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AocModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AocModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
