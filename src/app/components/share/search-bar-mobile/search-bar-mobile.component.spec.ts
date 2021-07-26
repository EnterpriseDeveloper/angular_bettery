import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarMobileComponent } from './search-bar-mobile.component';

describe('SearchBarMobileComponent', () => {
  let component: SearchBarMobileComponent;
  let fixture: ComponentFixture<SearchBarMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchBarMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
