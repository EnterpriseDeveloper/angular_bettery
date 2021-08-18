import { Component, HostListener, OnChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { Answer } from '../../../../models/Answer.model';
import { User } from '../../../../models/User.model';
import { PostService } from '../../../../services/post.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../../registration/registration/registration.component';
import { EventsTemplatesDesktopComponent } from '../../../createEvent/desktop/events-templates-desktop/events-templates-desktop.component';
import { Coins } from '../../../../models/Coins.model';
import { EventModel } from '../../../../models/Event.model';

@Component({
  selector: 'eventFeed',
  templateUrl: './eventFeed.component.html',
  styleUrls: ['./eventFeed.component.sass']
})
export class EventFeedComponent implements OnDestroy {
  public spinner: boolean = true;
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
  newCommentList;

  pureData: EventModel;
  scrollDistanceFrom = 0;
  scrollDistanceTo = 5;
  newQuestions = [];

  currentComment = 0;
  scrollTop = 0;
  searchWord = '';
  commentResetFlag: boolean;

  activeBtn = 'trending';
  queryPath = 'publicEvents/get_all';

  timelineActive: boolean;
  showEnd = false;
  filterMode = false;
  finishLoading = false;
  isMobile: boolean;

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
        from: from,
        to: to,
        search: param,
        sort: sort,
        finished: this.showEnd
      };
    }

    if (path === 'user/event_activites') {
      data = {
        from: from,
        to: to,
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
      } else {
        this.pureData.events.forEach(el => this.newQuestions.push(el));
      }
      if (this.timelineActive) {
        this.timelineActive = false;
      }
      this.spinner = false;
      this.finishLoading = this.newQuestions.length == this.pureData.amount ? true : false;

    }, (err) => {
      this.spinner = false;
      console.log(err);
    });
  }

  commentById($event) {
    if ($event) {
      const list = this.newQuestions.find((o) => {
        return o.id == $event;
      });
      this.commentList = list;
    }
  }

  colorForRoom(color) {
    if (this.newQuestions) {
      return {
        'background': color
      };
    } else {
      return;
    }
  }

  commentTopPosition() {
    if (document.documentElement.scrollTop < 278) {
      return { 'top': (278 - this.scrollTop) + 'px' };
    } else {
      return { 'top': 0 };
    }
  }

  @HostListener('window:scroll', ['$event'])
  listenScroll() {
    this.scrollTop = document.documentElement.scrollTop;
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
      if (!this.userData) {
        this.modalService.open(RegistrationComponent, { centered: true });
      } else {
        this.queryPath = 'user/event_activites';
        this.getData(this.queryPath, 0, 5, this.searchWord, '');
      }
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

    this.getData(this.queryPath, this.scrollDistanceFrom, this.scrollDistanceTo, this.searchWord, this.activeBtn);
    this.filterMode = data.showEnd;
  }

  openCreateEventModal() {
    this.modalService.open(EventsTemplatesDesktopComponent, { centered: true });
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
