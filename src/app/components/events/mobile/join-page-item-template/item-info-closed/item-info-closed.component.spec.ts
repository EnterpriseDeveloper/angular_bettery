import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemInfoClosedComponent } from './item-info-closed.component';

describe('ItemInfoClosedComponent', () => {
  let component: ItemInfoClosedComponent;
  let fixture: ComponentFixture<ItemInfoClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemInfoClosedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemInfoClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
