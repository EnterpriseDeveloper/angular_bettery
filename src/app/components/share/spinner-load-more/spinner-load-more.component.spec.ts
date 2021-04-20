import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerLoadMoreComponent } from './spinner-load-more.component';

describe('SpinnerLoadMoreComponent', () => {
  let component: SpinnerLoadMoreComponent;
  let fixture: ComponentFixture<SpinnerLoadMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerLoadMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerLoadMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
