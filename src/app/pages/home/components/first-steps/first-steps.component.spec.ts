import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstStepsComponent } from './first-steps.component';

describe('FirstStepsComponent', () => {
  let component: FirstStepsComponent;
  let fixture: ComponentFixture<FirstStepsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirstStepsComponent]
    });
    fixture = TestBed.createComponent(FirstStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
