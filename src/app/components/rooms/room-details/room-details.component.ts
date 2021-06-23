import {Component, OnInit, OnDestroy, HostListener, EventEmitter} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {PostService} from '../../../services/post.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.state';
import {Answer} from '../../../models/Answer.model';
import {User} from '../../../models/User.model';
import _ from 'lodash';
import {RegistrationComponent} from '../../registration/registration.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Coins} from '../../../models/Coins.model';
import {RoomDetails} from '../../../models/RoomDetails.model';
import {EventModel, Event} from '../../../models/Event.model';
import {PageScrollService} from 'ngx-page-scroll-core';
import {SessionStorageService} from '../sessionStorage-service/session-storage.service';


@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.sass']
})
export class RoomDetailsComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  infoSub: Subscription;
  eventSub: Subscription;
  storeCoinsSubscrive: Subscription;
  storeUserSubscribe: Subscription;
  joinRoomSub: Subscription;
  leaveRoomSub: Subscription;
  notificationRoomSub: Subscription;
  sessionStorageSub: Subscription;
  roomDetails: RoomDetails;
  roomEvents: Event[] = [];
  coinInfo: Coins = null;
  myAnswers: Answer[];
  pureData: EventModel;
  userId: number = null;
  userData: any;
  fromComponent: string = 'room';
  commentList: Event;
  scrollDistanceFrom = 0;
  scrollDistanceTo = 5;
  bottom = false;
  allData: any = [];
  spinner = true;
  scrollTop = 0;
  searchWord = '';
  timeout: any;
  commentResetFlag: boolean;
  roomData: any;
  disabledButton: boolean = false;
  sessionStorageValue: string;
  finishLoading = false;
  isMobile: boolean;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private pageScrollService: PageScrollService,
    private sessionStorageService: SessionStorageService,
  ) {
    this.storeUserSubscribe = this.store.select('user').subscribe((x: User[]) => {
      if (x.length === 0) {
        this.userId = null;
        this.userData = undefined;
        this.scrollDistanceFrom = 0;
        this.bottom = false;
        this.getAllData();
      } else {
        this.userId = x[0]._id;
        this.userData = x[0];
        this.allData = [];
        this.scrollDistanceFrom = 0;
        this.bottom = false;
        this.getAllData();
      }
    });
    this.storeCoinsSubscrive = this.store.select('coins').subscribe((x: Coins[]) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    });
    this.mobileCheck();
  }

  ngOnInit(): void {
    this.sessionStorageSub = this.sessionStorageService.eventIdValue.subscribe(e => {
      this.sessionStorageValue = e;
      if (this.sessionStorageValue) {
        this.scrollTo();
      }
    });
  }

  scrollTo() {
    const event = new EventEmitter<boolean>();
    if (this.sessionStorageValue) {
      this.pageScrollService.scroll({
        document,
        scrollTarget: '#' + this.sessionStorageValue,
        scrollOffset: 50,
        duration: 300,
        scrollFinishListener: event
      });
      event.subscribe((targetReached) => this.finishScrollAnimation(targetReached, this.sessionStorageValue));
    }
  }

  finishScrollAnimation(event: boolean, id) {
    const el = document.getElementById('id-' + id);

    const styleStart = 'box-shadow: 0px 0px 20px 2px #26A1D3; border-radius: 20px; box-sizing: content-box';
    const styleFinish = '';

    if (event && el) {
      el.style.cssText = styleStart;
    }

    if (event && el) {
      setTimeout(() => {
        el.style.cssText = styleFinish;
        setTimeout(() => {
          el.style.cssText = styleStart;
          setTimeout(() => {
            el.style.cssText = styleFinish;
          }, 100);
        }, 150);
        sessionStorage.removeItem('eventId');
        this.sessionStorageValue = undefined;
      }, 300);
    }
  }

  getAllData() {
    this.routeSub = this.route.params.subscribe(params => {
      this.roomData = {
        roomId: Number(params.id),
        userId: this.userId,
      };
      this.getRoomInfo(this.roomData);
      this.getRoomEvent(this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord);
    });
  }

  getRoomInfo(data) {
    this.infoSub = this.postService.post('room/info', data).subscribe((value: RoomDetails) => {
      this.roomDetails = value;
      this.disabledButton = false;
    }, (err) => {
      console.log(err);
    });
  }

  getRoomEvent(from, to, search) {
    let param;
    if (search.length >= 3) {
      param = search;
    } else {
      param = '';
    }
    let data = {
      id: Number(this.roomData?.roomId),
      from: from,
      to: to,
      search: param
    };

    this.eventSub = this.postService.post('room/get_event_by_room_id', data).subscribe((value: EventModel) => {
      this.pureData = value;

      if (this.roomEvents.length == 0) {
        this.commentList = value.events[0];
      }
      if (from == 0) {
        this.roomEvents = value.events;
        this.myAnswers = this.getAnswers(value.events);
      } else {
        value.events.forEach(el => this.roomEvents.push(el));
        this.myAnswers = this.getAnswers(this.roomEvents);
      }
      this.allData = this.roomEvents;
      if (this.commentResetFlag && this.roomEvents.length > 0) {
        this.commentById(this.roomEvents[0].id);
        this.commentResetFlag = false;
      }
      this.spinner = false;
      this.finishLoading = this.roomEvents.length == this.pureData.amount ? true : false;
      if (this.sessionStorageValue) {
        this.scrollTo();
      }
    }, (err) => {
      console.log(err);
    });
  }

  getAnswers(x) {
    return x.map((data) => {
      return {
        event_id: data.id,
        answer: this.findAnswer(data).answer,
        from: this.findAnswer(data).from,
        answered: this.findAnswer(data).answer != undefined ? true : false,
        amount: 0,
        betAmount: this.findAnswer(data).amount
      };
    });
  }

  findAnswer(data) {
    let findParticipiant = _.findIndex(data.parcipiantAnswers, {'userId': this.userId});
    if (findParticipiant === -1) {
      let findValidators = _.findIndex(data.validatorsAnswers, {'userId': this.userId});
      return {
        answer: findValidators !== -1 ? data.validatorsAnswers[findValidators].answer : undefined,
        from: 'validator',
        amount: 0
      };
    } else {
      return {
        answer: data.parcipiantAnswers[findParticipiant].answer,
        from: 'participant',
        amount: data.parcipiantAnswers[findParticipiant].amount
      };
    }
  }


  infoRoomColor(value) {
    return {'background': value};
  }

  commentById($event) {
    if ($event) {
      let newCommentList = _.find(this.roomEvents, (o) => {
        return o.id == $event;
      });
      this.commentList = newCommentList;
    }
  }

  getCommentRoomColor(color) {
    return {'background': color};
  }

  onScrollQuizTemplate() {
    if (this.pureData?.amount > this.scrollDistanceTo) {
      this.scrollDistanceFrom = this.scrollDistanceFrom + 5;
      this.scrollDistanceTo = this.scrollDistanceTo + 5;
      if (this.scrollDistanceTo >= this.pureData?.amount) {
        this.scrollDistanceTo = this.pureData?.amount;
        if (!this.bottom) {
          this.bottom = true;
          this.getRoomEvent(this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord);
        }
      } else {
        this.getRoomEvent(this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord);
      }
    }
  }

  joinToRoom() {
    if (!this.userId) {
      this.modalService.open(RegistrationComponent, {centered: true});
    } else {
      this.disabledButton = true;
      let data = {
        roomId: Number(this.roomData?.roomId)
      };
      this.joinRoomSub = this.postService.post('room/join', data).subscribe((x) => {
        this.getRoomInfo(data);
      }, (err) => {
        console.log(err);
      });
    }
  }

  leaveRoom() {
    this.disabledButton = true;
    let data = {
      joinedId: this.roomDetails.joinedId,
    };
    this.leaveRoomSub = this.postService.post('room/leave', data).subscribe(() => {
      let dataRoomInfo = {
        userId: this.userId,
        roomId: Number(this.roomData?.roomId)
      };
      this.getRoomInfo(dataRoomInfo);
    }, (err) => {
      console.log(err);
    });
  }

  notification(x) {
    if (!this.disabledButton) {
      let data = {
        joinedId: this.roomDetails.joinedId,
        subscribe: x
      };
      this.disabledButton = true;
      this.notificationRoomSub = this.postService.post('room/notification', data).subscribe(() => {
        let dataRoomInfo = {
          userId: this.userId,
          roomId: Number(this.roomData?.roomId)
        };
        this.getRoomInfo(dataRoomInfo);
      }, (err) => {
        console.log(err);
      });
    }

  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.infoSub) {
      this.infoSub.unsubscribe();
    }
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
    if (this.storeCoinsSubscrive) {
      this.storeCoinsSubscrive.unsubscribe();
    }
    if (this.storeUserSubscribe) {
      this.storeUserSubscribe.unsubscribe();
    }
    if (this.joinRoomSub) {
      this.joinRoomSub.unsubscribe();
    }
    if (this.leaveRoomSub) {
      this.leaveRoomSub.unsubscribe();
    }
    if (this.notificationRoomSub) {
      this.notificationRoomSub.unsubscribe();
    }
    if (this.sessionStorageSub) {
      this.sessionStorageSub.unsubscribe();
    }
  }

  @HostListener('window:scroll', ['$event'])
  listenScroll() {
    this.scrollTop = document.documentElement.scrollTop;
  }

  commentTopPosition() {
    if (document.documentElement.scrollTop < 422) {
      return {'top': (422 - this.scrollTop) + 'px'};
    } else {
      return {'top': 0};
    }
  }

  letsFindEvent() {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {

      if (this.searchWord.length >= 3) {
        this.getRoomEvent(0, 5, this.searchWord);
        this.commentResetFlag = true;
      } else {
        this.getRoomEvent(0, 5, '');
        this.commentResetFlag = true;
      }
    }, 300);
  }

  mobileCheck() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)) {

      this.isMobile = true;
    }
  }
}
