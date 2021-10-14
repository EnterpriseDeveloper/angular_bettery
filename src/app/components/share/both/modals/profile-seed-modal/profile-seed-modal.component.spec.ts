import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSeedModalComponent } from './profile-seed-modal.component';

describe('ProfileSeedModalComponent', () => {
  let component: ProfileSeedModalComponent;
  let fixture: ComponentFixture<ProfileSeedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileSeedModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSeedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
