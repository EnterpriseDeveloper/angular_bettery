import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MakeRulesTabComponent} from './make-rules-tab.component';
import {FormBuilder} from "@angular/forms";
import {By} from '@angular/platform-browser';
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {Store, StoreModule} from "@ngrx/store";
import {RouterTestingModule} from "@angular/router/testing";
import {Router} from "@angular/router";
import {InfoModalComponent} from "../../../share/info-modal/info-modal.component";
import {of} from "rxjs";
import {AppState} from "../../../../app.state";
import {formDataAction} from "../../../../actions/newEvent.actions";


export class MockNgbModalRef {
  componentInstance = {
    name: undefined,
    name1: undefined,
    boldName: undefined,
    link: undefined,
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

describe('MakeRulesTabComponent', () => {
  let component: MakeRulesTabComponent;
  let fixture: ComponentFixture<MakeRulesTabComponent>;
  let spy: jasmine.Spy;
  let ngbModal: NgbModal;
  let mockModalRef: MockNgbModalRef = new MockNgbModalRef();
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MakeRulesTabComponent],
      imports: [
        NgbModule,
        StoreModule.forRoot({}),
        RouterTestingModule
      ],
      providers: [
        {provide: FormBuilder},
        {provide: Store, useClass: StoreMock},
        {provide: Router, useClass: RouterStub},
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeRulesTabComponent);
    component = fixture.componentInstance;
    ngbModal = TestBed.get(NgbModal);
    spy = spyOn(ngbModal, 'open').and.returnValue(mockModalRef as any);


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
    store = TestBed.get(Store);
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form in MakeRulesTabComponent', () => {
    it('should create "privateForm" with 3 controls', () => {
      expect(component.privateForm.contains('winner')).toBeTruthy();
      expect(component.privateForm.contains('losers')).toBeTruthy();
      expect(component.privateForm.contains('privateEndTime')).toBeTruthy();
    });

    it('should create "publicForm" with 4 controls', () => {
      expect(component.publicForm.contains('tokenType')).toBeTruthy();
      expect(component.publicForm.contains('publicEndTime')).toBeTruthy();
      expect(component.publicForm.contains('expertsCountType')).toBeTruthy();
      expect(component.publicForm.contains('expertsCount')).toBeTruthy();
    });

    it('should create "exactTime" form with 3 controls', () => {
      expect(component.exactTime.contains('day')).toBeTruthy();
      expect(component.exactTime.contains('month')).toBeTruthy();
      expect(component.exactTime.contains('year')).toBeTruthy();
    });

    it('should mark privateForm fields as invalid if empty value', () => {
      const winnerControl = component.privateForm.get('winner');
      const loserControl = component.privateForm.get('losers');
      const privateEndTimeControl = component.privateForm.get('privateEndTime');

      winnerControl.setValue('');
      loserControl.setValue('');
      privateEndTimeControl.setValue('');

      expect(winnerControl.valid).toBeFalsy();
      expect(loserControl.valid).toBeFalsy();
      expect(privateEndTimeControl.valid).toBeFalsy();
    });

    it('should mark publicForm fields as invalid if empty value', () => {
      const publicEndTimeControl = component.publicForm.get('publicEndTime');
      const expertsCountControl = component.publicForm.get('expertsCount');

      publicEndTimeControl.setValue('');
      expertsCountControl.setValue('');

      expect(publicEndTimeControl.valid).toBeFalsy();

      expect(expertsCountControl.valid).toBeFalsy();
    });
  });

  describe('Button Back in MakeRulesTabComponent', () => {
    let data;
    beforeEach(() => {
      data = {
        ...component.publicForm.value,
        ...component.privateForm.value,
        ...component.exactTime.value,
        ...component.timeData,
        'exactTimeBool': component.exactTimeBool
      };
    });


    it('should navigate to "/create-room"  and dispatch data to store, when eventType === "private"', () => {
      let router = TestBed.get(Router);
      let spy = spyOn(router, 'navigate');
      const btnCancel = fixture.debugElement.query(By.css('.cancel'));
      btnCancel.triggerEventHandler('click', null);
      expect(spy).toHaveBeenCalledWith(['/create-room']);
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    });

    it('should navigate to "/create-room"  and dispatch data to store, when eventType === "public"', () => {
      let router = TestBed.get(Router);
      let spy = spyOn(router, 'navigate');
      component.formData.eventType = 'public';
      fixture.detectChanges();

      const btnCancel = fixture.debugElement.query(By.css('.cancel'));
      btnCancel.triggerEventHandler('click', null);
      expect(spy).toHaveBeenCalledWith(['/create-room']);
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    });
  });

  describe('Button Next in MakeRulesTabComponent', () => {
    it('should navigate to "/create-private-event" and dispatch data to store, when eventType === "private"', () => {
      let router = TestBed.get(Router);
      let spy = spyOn(router, 'navigate');
      const winnerControl = component.privateForm.get('winner');
      const loserControl = component.privateForm.get('losers');
      const endTimeControl = component.privateForm.get('privateEndTime');

      winnerControl.setValue('winner');
      loserControl.setValue('loser');
      endTimeControl.setValue(10000);

      const btnNext = fixture.debugElement.query(By.css('.next'));
      btnNext.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalledWith(['/create-private-event']);
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    });

    it('should send data to store and navigate to "/create-public-event", when eventType === "public"', () => {
      let router = TestBed.get(Router);
      let spy = spyOn(router, 'navigate');
      component.formData.eventType = 'public';


      const tokenTypeControl = component.publicForm.get('tokenType');
      const publicEndTimeControl = component.publicForm.get('publicEndTime');
      const expertsCountTypeControl = component.publicForm.get('expertsCountType');
      const expertsCountControl = component.publicForm.get('expertsCount');

      component.formData.publicEndTime = 11;

      publicEndTimeControl.setValue(11);
      expertsCountControl.setValue(2);
      tokenTypeControl.setValue('token');
      expertsCountTypeControl.setValue('custom');
      fixture.detectChanges();

      const btnNext = fixture.debugElement.query(By.css('.next'));
      btnNext.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalledWith(['/create-public-event']);
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(formDataAction({formData: component.formData}));
    });
  });

  it('should open modal windows bootstrap openHowEventsWorkFriend', () => {
    component.openHowEventsWorkFriend('content');
    expect(ngbModal.open).toHaveBeenCalled();
    expect(component.modalTrigger).toBeTruthy();
  });

  it('should open modal windows bootstrap openHowEventsWorkSocial()', () => {
    component.formData.eventType = 'public';
    fixture.detectChanges();

    component.openHowEventsWorkSocial('content2');
    expect(ngbModal.open).toHaveBeenCalled();
    expect(component.modalTrigger).toBeFalsy();
  });

  it('should open Calendar modal windows bootstrap openCalendar()', () => {
    component.formData.eventType = 'public';
    fixture.detectChanges();

    const btnCalendar = fixture.debugElement.query(By.css('.calendarImg'));
    btnCalendar.triggerEventHandler('click', null);
    expect(ngbModal.open).toHaveBeenCalled();
  });

  it('InfoModalComponent should be called with all componentInstance', () => {
    component.formData.eventType = 'public';
    fixture.detectChanges();

    const betWith = fixture.debugElement.query(By.css('.link'));
    betWith.triggerEventHandler('click', null);

    expect(ngbModal.open).toHaveBeenCalledWith(InfoModalComponent, {centered: true});
    expect(mockModalRef.componentInstance.name).toBeTruthy();
    expect(mockModalRef.componentInstance.name1).toBeTruthy();
    expect(mockModalRef.componentInstance.boldName).toBeTruthy();
    expect(mockModalRef.componentInstance.link).toBeTruthy();
  });

  it('should get data from the store for all selectors ("createEvent")', () => {
    expect(store.select).toHaveBeenCalledWith('createEvent');
  });
});
