import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedPhraseModalComponent } from './seed-phrase-modal.component';

describe('SeedPhraseModalComponent', () => {
  let component: SeedPhraseModalComponent;
  let fixture: ComponentFixture<SeedPhraseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeedPhraseModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedPhraseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
