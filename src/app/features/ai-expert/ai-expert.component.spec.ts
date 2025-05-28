import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIExpertComponent } from './ai-expert.component';

describe('AiExpertComponent', () => {
  let component: AIExpertComponent;
  let fixture: ComponentFixture<AIExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AIExpertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
