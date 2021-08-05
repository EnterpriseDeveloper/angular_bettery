import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizEventFinishComponent } from './quiz-event-finish.component';

describe('QuizEventFinishComponent', () => {
  let component: QuizEventFinishComponent;
  let fixture: ComponentFixture<QuizEventFinishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizEventFinishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizEventFinishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
