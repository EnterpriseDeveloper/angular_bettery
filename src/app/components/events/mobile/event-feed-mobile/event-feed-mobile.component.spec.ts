import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFeedMobileComponent } from './event-feed-mobile.component';

describe('EventFeedMobileComponent', () => {
  let component: EventFeedMobileComponent;
  let fixture: ComponentFixture<EventFeedMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventFeedMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFeedMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
