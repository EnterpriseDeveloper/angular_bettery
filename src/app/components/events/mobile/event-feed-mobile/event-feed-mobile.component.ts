import {Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import {Answer} from '../../../../models/Answer.model';
import {User} from '../../../../models/User.model';
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RegistrationComponent} from '../../../registration/registration.component';
import {EventsTemplatesDesktopComponent} from '../../../createEvent/desktop/events-templates-desktop/events-templates-desktop.component';
import {Coins} from '../../../../models/Coins.model';
import {EventModel} from '../../../../models/Event.model';
import {$e} from 'codelyzer/angular/styles/chars';

@Component({
  selector: 'app-event-feed-mobile',
  templateUrl: './event-feed-mobile.component.html',
  styleUrls: ['./event-feed-mobile.component.sass']
})
export class EventFeedMobileComponent implements OnDestroy {
  public spinner = true;
  myAnswers: Answer[] = [];
  userId: number = null;
  coinInfo: Coins = null;
  userData: User;
  storeUserSubscribe: Subscription;
  storeCoinsSubscrive: Subscription;
  postSubsctibe: Subscription;
  parcipiantFilter = true;
  validateFilter = true;
  historyFilter = false;
  fromComponent = 'eventFeed';
  commentList;
  pureData: EventModel;
  scrollDistanceFrom = 0;
  scrollDistanceTo = 5;
  newQuestions = [];
  comingSoonType = 'social';
  openedDetailArr = [];
  currentComment = 0;
  searchWord = '';
  commentResetFlag: boolean;

  activeBtn = 'trending';
  queryPath = 'publicEvents/get_all';

  timelineActive: boolean;
  showEnd = false;
  filterMode = false;
  finishLoading = false;
  isMobile: boolean;
  prevScrollPos = window.scrollY;

  constructor(
    private store: Store<AppState>,
    private postService: PostService,
    private modalService: NgbModal
  ) {
    this.storeUserSubscribe = this.store.select('user').subscribe((x: User[]) => {
      if (x.length === 0) {
        this.userId = null;
        this.userData = undefined;
        this.activeBtn = 'trending';
        this.scrollDistanceFrom = 0;
        this.activeBtnFromSearchBar(this.activeBtn);
      } else {
        this.userId = x[0]._id;
        this.userData = x[0];
        if (this.activeBtn === 'following') {
          this.openedDetailArr = [];
          this.newQuestions = null;
          this.spinner = true;
          this.queryPath = 'user/event_activites';
          this.getData(this.queryPath, 0, 5, this.searchWord, '');
        } else {
          this.scrollDistanceFrom = 0;
          this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
        }
      }
    });
    this.storeCoinsSubscrive = this.store.select('coins').subscribe((x: Coins[]) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    });
    this.mobileCheck();
  }


  getData(path, from, to, search, sort) {
    let param;
    let data = {};
    if (search.length >= 3) {
      param = search;
    } else {
      param = '';
    }

    if (path === 'publicEvents/get_all') {
      data = {
        from,
        to,
        search: param,
        sort,
        finished: this.showEnd
      };
    }

    if (path === 'user/event_activites') {
      data = {
        from,
        to,
        search: param,
        userId: this.userData?._id,
        finished: this.showEnd
      };
    }
    this.postSubsctibe = this.postService.post(path, data).subscribe((x: EventModel) => {
      if (this.pureData === undefined || this.pureData.events.length === 0) {
        this.commentList = x.events[this.currentComment];
      }
      if (this.commentResetFlag) {
        this.commentList = x.events[this.currentComment];
        this.commentResetFlag = false;
      }
      this.pureData = x;
      if (from == 0) {
        this.newQuestions = this.pureData.events;

        this.newQuestions.forEach((e, i) => {
          e.detailOpened = this.openedDetailArr.includes(i);
        });
      } else {
        this.pureData.events.forEach(el => this.newQuestions.push(el));

        this.newQuestions.forEach((e, i) => {
          e.detailOpened = this.openedDetailArr.includes(i);
        });
      }
      if (this.timelineActive === false) {
        this.openTimeline(this.timelineActive);
      }
      this.spinner = false;
      this.finishLoading = this.newQuestions.length == this.pureData.amount ? true : false;
    }, (err) => {
      this.spinner = false;
      console.log(err);
    });
  }

  arrWithOpenedDetails(event) {
    if (event.isOpened && !(this.openedDetailArr.includes(event.index))) {
      this.openedDetailArr.push(event.index);
    }
    if (!event.isOpened && (this.openedDetailArr.includes(event.index))) {
      this.openedDetailArr = this.openedDetailArr.filter(e => e !== event.index);
    }
  }


  @HostListener('window:scroll', ['$event'])
  showHeader() {
    if (this.prevScrollPos > window.pageYOffset) {
      document.getElementById('bar_on_hide').className = 'block_pos_fix';

    } else if (this.prevScrollPos < window.pageYOffset && (window.pageYOffset > 150)) {
      document.getElementById('bar_on_hide').className = 'd_none_pos_rel';
    }
    this.prevScrollPos = window.pageYOffset;
  }

  onScrollQuizTemplate() {
    if (this.scrollDistanceTo < this.pureData?.amount) {
      this.scrollDistanceFrom = this.scrollDistanceFrom + 5;
      this.scrollDistanceTo = this.scrollDistanceTo + 5;
      this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
    } else if (this.pureData?.amount % 5 !== 0 && (this.scrollDistanceTo + this.pureData?.amount % 5 <= this.pureData?.amount)) {
      this.scrollDistanceFrom = this.scrollDistanceTo + this.pureData?.amount % 5;
      this.scrollDistanceTo = this.scrollDistanceTo + this.pureData?.amount % 5;
      this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo + this.pureData?.amount % 5, this.searchWord, this.activeBtn);
    } else {
      return;
    }

  }

  ngOnDestroy() {
    if (this.storeUserSubscribe) {
      this.storeUserSubscribe.unsubscribe();
    }
    if (this.storeCoinsSubscrive) {
      this.storeCoinsSubscrive.unsubscribe();
    }
    if (this.postSubsctibe) {
      this.postSubsctibe.unsubscribe();
    }
  }

  letsFindNewQuestion($event: string) {
    this.searchWord = $event;
    this.scrollDistanceFrom = 0;
    this.scrollDistanceTo = 5;

    this.newQuestions = null;
    if (this.activeBtn !== 'pro' || this.comingSoonType === 'moments' || this.comingSoonType === 'live') {

      this.spinner = true;
    }
    if (this.searchWord.length >= 3) {
      this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
      this.commentResetFlag = true;

    } else {

      this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, '', this.activeBtn);
      this.commentResetFlag = true;
    }
  }

  activeBtnFromSearchBar(activeBtn) {
    this.activeBtn = activeBtn;
    this.scrollDistanceFrom = 0;
    this.scrollDistanceTo = 5;

    if (this.activeBtn === 'controversial' || this.activeBtn === 'trending') {
      this.openedDetailArr = [];
      this.newQuestions = null;
      this.spinner = true;
      if (this.searchWord.length >= 3) {
        this.queryPath = 'publicEvents/get_all';
        this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
        this.commentResetFlag = true;

      } else {
        this.queryPath = 'publicEvents/get_all';
        this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, '', this.activeBtn);
      }
    }

    if (this.activeBtn === 'following') {
      this.newQuestions = null;
      this.spinner = true;
      this.openedDetailArr = [];
      if (!this.userData) {
        this.modalService.open(RegistrationComponent, {centered: true});
        this.spinner = false;
      } else {
        this.queryPath = 'user/event_activites';
        this.getData(this.queryPath, 0, 5, this.searchWord, '');
      }
    }
    if (this.activeBtn === 'pro') {
      this.newQuestions = null;
      this.spinner = false;
      this.comingSoonType = 'social';

    }
  }

  openTimeline($event: any) {
    if ($event) {
      this.timelineActive = !this.timelineActive;
    }
  }

  letsFilterData(data) {
    this.scrollDistanceFrom = 0;
    this.scrollDistanceTo = 5;

    this.showEnd = data.showEnd;

    if (data.showEnd !== this.filterMode) {
      this.spinner = true;
      this.newQuestions = null;
      this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
      this.filterMode = data.showEnd;
    }

  }

  openCreateEventModal() {
    this.modalService.open(EventsTemplatesDesktopComponent, {centered: true});
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

  setComingType($event) {
    if (!$event.active) {
      this.newQuestions = null;
      this.spinner = true;
      this.activeBtnFromSearchBar(this.activeBtn);
      this.comingSoonType = $event.type;

    } else if ($event.active) {
      this.newQuestions = null;
      this.spinner = true;
      this.activeBtn = $event.active;
      this.activeBtnFromSearchBar(this.activeBtn);
      this.comingSoonType = $event.type;
    }
  }

}
