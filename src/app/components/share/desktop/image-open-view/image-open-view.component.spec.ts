import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOpenViewComponent } from './image-open-view.component';

describe('ImageOpenViewComponent', () => {
  let component: ImageOpenViewComponent;
  let fixture: ComponentFixture<ImageOpenViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageOpenViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageOpenViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
