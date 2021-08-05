import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizChooseRoleComponent } from './quiz-choose-role.component';

describe('QuizChooseRoleComponent', () => {
  let component: QuizChooseRoleComponent;
  let fixture: ComponentFixture<QuizChooseRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizChooseRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizChooseRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
