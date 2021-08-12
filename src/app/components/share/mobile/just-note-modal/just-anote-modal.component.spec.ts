import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JustANoteModalComponent } from './just-anote-modal.component';

describe('JustANoteModalComponent', () => {
  let component: JustANoteModalComponent;
  let fixture: ComponentFixture<JustANoteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JustANoteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JustANoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
