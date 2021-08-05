import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTimeLineMobileComponent } from './filter-time-line-mobile.component';

describe('FilterTimeLineMobileComponent', () => {
  let component: FilterTimeLineMobileComponent;
  let fixture: ComponentFixture<FilterTimeLineMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterTimeLineMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterTimeLineMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
