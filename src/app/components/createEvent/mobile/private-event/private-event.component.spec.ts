import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PrivateEventComponent} from './private-event.component';
import {GetService} from "../../../../services/get.service";
import {PostService} from "../../../../services/post.service";
import {Store, StoreModule} from "@ngrx/store";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {By} from "@angular/platform-browser";
import {EMPTY, of} from "rxjs";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {InfoModalComponent} from "../../../share/info-modal/info-modal.component";
import {Router} from "@angular/router";
import {AppState} from "../../../../app.state";

export class MockNgbModalRef {
  componentInstance = {
    name: undefined,
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

describe('PrivateEventComponent', () => {
  let component: PrivateEventComponent;
  let fixture: ComponentFixture<PrivateEventComponent>;
  let service: PostService;
  let ngbModal: NgbModal;
  let mockModalRef: MockNgbModalRef = new MockNgbModalRef();
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrivateEventComponent],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        NgbModule
      ],
      providers: [
        {provide: GetService},
        {provide: PostService},
        {provide: Store, useClass: StoreMock},
        {provide: Router, useClass: RouterStub}
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateEventComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(PostService);
    ngbModal = TestBed.get(NgbModal);
    component.host = [
      {
        _id: 1,
        nickName: 'string',
        email: 'string',
        wallet: 'string',
        listHostEvents: {},
        listParticipantEvents: {},
        listValidatorEvents: {},
        historyTransaction: {},
        avatar: 'string',
        verifier: 'string',
      }
    ];
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancel() should navigate to "/makeRules"  after click the BACK button', () => {
    let router = TestBed.get(Router);
    let spy = spyOn(router, 'navigate');
    const btnCancel = fixture.debugElement.query(By.css('.cancel'));
    btnCancel.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledWith(['/makeRules']);
  });

  it('createEvent() the PostService should be called', () => {
    fixture.detectChanges();

    const spy = spyOn(service, 'post').and.callFake(() => {
      return EMPTY;
    });

    const btn = fixture.debugElement.query(By.css('.next'));
    btn.triggerEventHandler('click', null);

    expect(spy).toHaveBeenCalled();
  });

  it('setToDb() data should be sent to the database', () => {
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
    fixture.detectChanges();

    const spy = spyOn(service, 'post').and.returnValue(of(EMPTY));
    component.setToDb(1, 1);
    expect(spy).toHaveBeenCalled();
    expect(component.created).toBeTruthy();
  });

  it('InfoModalComponent should be called with all componentInstance fields', () => {
    component.created = true;
    spyOn(ngbModal, 'open').and.returnValue(mockModalRef as any);
    fixture.detectChanges();
    const btnModalOpen = fixture.debugElement.query(By.css('.linkYellow'));
    btnModalOpen.triggerEventHandler('click', null);

    expect(ngbModal.open).toHaveBeenCalledWith(InfoModalComponent, {centered: true});
    expect(mockModalRef.componentInstance.name).toBeTruthy();
    expect(mockModalRef.componentInstance.boldName).toBeTruthy();
    expect(mockModalRef.componentInstance.link).toBeTruthy();
  });

  it('should get data from the store for all selectors ("user", "createEvent")', () => {
    expect(store.select).toHaveBeenCalledWith('user');
    expect(store.select).toHaveBeenCalledWith('createEvent');
  });
});
