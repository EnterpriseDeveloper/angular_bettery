import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainTransferComponent } from './deposit.component';

describe('DepositComponent', () => {
  let component: ChainTransferComponent;
  let fixture: ComponentFixture<ChainTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
