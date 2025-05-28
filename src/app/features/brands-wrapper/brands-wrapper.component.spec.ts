import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsWrapperComponent } from './brands-wrapper.component';

describe('BrandsWrapperComponent', () => {
  let component: BrandsWrapperComponent;
  let fixture: ComponentFixture<BrandsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandsWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
