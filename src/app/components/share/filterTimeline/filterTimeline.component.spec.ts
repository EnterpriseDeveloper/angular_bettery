import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTimelineComponent } from './filterTimeline.component';

describe('FilterTimelineComponent', () => {
  let component: FilterTimelineComponent;
  let fixture: ComponentFixture<FilterTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
