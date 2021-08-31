import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPayoutsComponent } from './my-payouts.component';

describe('MyPayoutsComponent', () => {
  let component: MyPayoutsComponent;
  let fixture: ComponentFixture<MyPayoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPayoutsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
