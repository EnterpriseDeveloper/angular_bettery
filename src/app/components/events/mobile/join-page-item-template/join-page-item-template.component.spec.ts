import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPageItemTemplateComponent } from './join-page-item-template.component';

describe('JoinPageItemTemplateComponent', () => {
  let component: JoinPageItemTemplateComponent;
  let fixture: ComponentFixture<JoinPageItemTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinPageItemTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinPageItemTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
