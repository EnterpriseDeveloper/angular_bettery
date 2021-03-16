import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsTemplateNewComponent } from './events-template-new.component';

describe('EventsTemplateNewComponent', () => {
  let component: EventsTemplateNewComponent;
  let fixture: ComponentFixture<EventsTemplateNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsTemplateNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsTemplateNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
