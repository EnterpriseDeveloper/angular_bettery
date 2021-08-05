import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizActionComponent } from './quiz-action.component';

describe('QuizActionComponent', () => {
  let component: QuizActionComponent;
  let fixture: ComponentFixture<QuizActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
