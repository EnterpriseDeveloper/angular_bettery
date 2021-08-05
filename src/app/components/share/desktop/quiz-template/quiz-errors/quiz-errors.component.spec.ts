import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizErrorsComponent } from './quiz-errors.component';

describe('QuizErrorsComponent', () => {
  let component: QuizErrorsComponent;
  let fixture: ComponentFixture<QuizErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
