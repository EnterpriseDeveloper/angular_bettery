import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionOptionsBlockComponent } from './question-options-block.component';

describe('QuestionOptionsBlockComponent', () => {
  let component: QuestionOptionsBlockComponent;
  let fixture: ComponentFixture<QuestionOptionsBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionOptionsBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionOptionsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
