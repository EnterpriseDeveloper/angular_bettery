import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SetQuestionTabComponent} from './set-question-tab.component';
import {Store, StoreModule} from "@ngrx/store";
import {PostService} from "../../../../services/post.service";
import {FormBuilder} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {By} from "@angular/platform-browser";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {RegistrationComponent} from "../../../registration/registration.component";
import {RouterTestingModule} from "@angular/router/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {AppState} from "../../../../app.state";
import {formDataAction} from "../../../../actions/newEvent.actions";

export class MockNgbModalRef {
  componentInstance = {
    openSpinner: undefined,
  };
  result: Promise<any> = new Promise((resolve, reject) => resolve(true));
}

class RouterStub {
  navigate(path: string[]) {
  }
}

class StoreMock {
  select = jasmine.createSpy().and.returnValue(of(null));
  dispatch = jasmine.createSpy();
}

describe('SetQuestionTabComponent', () => {
  let component: SetQuestionTabComponent;
  let fixture: ComponentFixture<SetQuestionTabComponent>;
  let spy: jasmine.Spy;
  let ngbModal: NgbModal;
  let mockModalRef: MockNgbModalRef = new MockNgbModalRef();
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetQuestionTabComponent],
      imports: [
        StoreModule.forRoot({}),
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule
      ],
      providers: [
        {provide: Store, useClass: StoreMock},
        {provide: PostService},
        {provide: FormBuilder},
        {provide: Router, useClass: RouterStub},
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetQuestionTabComponent);
    component = fixture.componentInstance;
    component.formData = {
      answers: [{name: 'dfvdfv'}, {name: 'dfvdcddfv'}],
      eventType: 'private',
      exactDay: '',
      exactHour: '',
      exactMinuts: '',
      exactMonth: '',
      exactTimeBool: false,
      exactYear: '',
      expertsCount: 2,
      expertsCountType: 'custom',
      losers: '',
      privateEndTime: '',
      publicEndTime: '',
      question: 'vfdvddfv',
      resolutionDetalis: '',
      roomColor: 'linear-gradient(228.16deg, #54DD96 -1.47%, #6360F7 97.79%)',
      roomId: '',
      roomName: '',
      tokenType: 'token',
      whichRoom: 'new',
      winner: ''
    };
    ngbModal = TestBed.get(NgbModal);
    store = TestBed.get(Store);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('Forms in Set-question-tab', () => {
    it('should create "createRoomForm" form', () => {
      expect(component.questionForm.contains('question')).toBeTruthy();
      expect(component.questionForm.contains('answers')).toBeTruthy();
      expect(component.questionForm.contains('details')).toBeTruthy();
    });
    it('should mark questionsForm fields as invalid if empty value', () => {
      const questionsControl = component.questionForm.get('question');
      questionsControl.setValue('');

      expect(questionsControl.valid).toBeFalsy();
    });
  });

  it('answesQuantity should  increase +1', () => {
    component.answesQuantity = 2;
    const btnAdd = fixture.debugElement.query(By.css('.add'));
    btnAdd.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.answesQuantity).toBe(3);

  });

  it('answesQuantity should decrease -1', () => {
    component.answesQuantity = 3;
    component.formData.answers = [{name: 'dfvdfv'}, {name: 'dfvdcddfv'}, {name: 'dfvdcddfv'}];
    component.ngOnInit();
    const control = component.questionForm.get('answers');
    fixture.detectChanges();

    const btnDelete = fixture.debugElement.query(By.css('.deleteButton'));
    btnDelete.triggerEventHandler('click', null);
    expect(control.value.length).toBe(2);
    expect(component.answesQuantity).toBe(2);
  });

  describe('Test onSubmit() after clicked NEXT button', () => {
    it('should dispatch correct data to the store,if the user is registered and redirect to "/create-room"', () => {
      let router = TestBed.get(Router);
      let spy = spyOn(router, 'navigate');
      component.registered = true;
      fixture.detectChanges();

      const btnNext = fixture.debugElement.query(By.css('.next'));
      btnNext.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalledWith(['/create-room']);
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    });

    it('if registered == false, should open modal registrationComponent', () => {
      component.registered = false;
      spyOn(ngbModal, 'open').and.returnValue(mockModalRef as any);
      fixture.detectChanges();

      const btnNext = fixture.debugElement.query(By.css('.next'));
      btnNext.triggerEventHandler('click', null);
      expect(ngbModal.open).toHaveBeenCalledWith(RegistrationComponent, {centered: true});
      expect(mockModalRef.componentInstance.openSpinner).toBe(true);
    });
  });

  it('should navigate to "/" home, after click CANCEL button and dispatch data to store', () => {
    let router = TestBed.get(Router);
    let spy = spyOn(router, 'navigate');

    const btnCancel = fixture.debugElement.query(By.css('.cancel'));
    btnCancel.triggerEventHandler('click', null);
    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    expect(spy).toHaveBeenCalledWith(['/']);
  });

  it('should get data from the store for all selectors ("user", "createEvent")', () => {
    expect(store.select).toHaveBeenCalledWith('user');
    expect(store.select).toHaveBeenCalledWith('createEvent');
  });
});
