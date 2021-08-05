import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTemplateComponent } from './quiz-template.component';

describe('QuizTemplateComponent', () => {
  let component: QuizTemplateComponent;
  let fixture: ComponentFixture<QuizTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
