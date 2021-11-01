import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { PostService } from '../../../../../services/post.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../../../share/both/modals/info-modal/info-modal.component';
import {PubEventMobile} from '../../../../../models/PubEventMobile.model';
import {User} from '../../../../../models/User.model';
import { RegistrationComponent } from '../../../../registration/registration/registration.component';


@Component({
  selector: 'event-start',
  templateUrl: './event-start.component.html',
  styleUrls: ['./event-start.component.sass']
})
export class EventStartComponent implements OnInit, OnChanges, OnDestroy {
  @Input('eventData') eventData: PubEventMobile;
  @Output() interacDone = new EventEmitter<number>();
  letsJoin: boolean = false;
  info: boolean = false;
  goToAction: boolean = false;
  joinedAs: string = undefined;
  validation: boolean = false;
  created: boolean = false;
  day: string | number;
  hour: string | number;
  minutes: string | number;
  seconds: string | number;
  userData: User = undefined;
  participatedAnswer = [];
  validatedAnswer = [];
  currentPool = 0;
  playersJoinde = 0;
  expertJoinned = 0;
  coinType: string;
  storeSub: Subscription;
  postSub: Subscription;
  themeChat = 'dark';
  copyLinkFlag: boolean;


  constructor(
    private http: PostService,
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
  }

  getUsers() {
    this.storeSub = this.store.select("user").subscribe((x: User[]) => {
      if (x.length != 0) {
        this.currentPool = 0;
        this.playersJoinde = 0;
        this.expertJoinned = 0;
        this.created = false;
        this.userData = x[0]
        this.letsFindActivites(x[0]);
        this.calculatePool()
      } else {
        this.userData = undefined;
        this.letsJoin = false;
        this.joinedAs = undefined;
        this.currentPool = 0;
        this.playersJoinde = 0;
        this.expertJoinned = 0;
        this.participatedAnswer = [];
        this.validatedAnswer = []
        this.goToAction = false;
        this.created = false;
      }
    });
  }

  ngOnChanges(changes) {
    if (changes['eventData'] !== undefined) {
      if (changes['eventData'].currentValue !== undefined) {
        this.coinType = this.eventData.currencyType == "token" ? "BET" : "ETH"
        this.currentPool = 0;
        this.playersJoinde = 0;
        this.expertJoinned = 0;
        this.remainderExperts();
        this.getUsers();
      }
    }
  }

  remainderExperts() {
    let expertDone = this.eventData.validatorsAnswers === undefined ? 0 : this.eventData.validatorsAnswers.length
    let epxertIn = this.eventData.validatorsAmount == 0 ? this.expertAmount() : this.eventData.validatorsAmount
    return epxertIn - expertDone;
  }

  expertAmount() {
    let part = this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  letsFindActivites(userData) {
    if (this.eventData.parcipiantAnswers) {
      let findParts = this.eventData.parcipiantAnswers.find((o) => {
        return o.userId == userData._id;
      });
      if (findParts) {
        this.participatedAnswer[0] = findParts;
        this.created = true;
      }
    }
    if (this.eventData.validatorsAnswers) {
      let findValid = this.eventData.validatorsAnswers.find((o) => {
        return o.userId == userData._id;
      });
      if (findValid) {
        this.validatedAnswer[0] = findValid;
        this.created = true;
      }
    }
    this.calculateDate();
    this.letsJoin = true;
  }

  calculatePool() {
    if (this.eventData.parcipiantAnswers) {
      this.eventData.parcipiantAnswers.forEach(x => {
        this.currentPool += x.amount;
        this.playersJoinde += 1;
      });
    }
    if (this.eventData.validatorsAnswers) {
      this.eventData.validatorsAnswers.forEach(() => {
        this.expertJoinned += 1;
      });
    }
  }

  getPartPos(i, from) {
    let size = from == "part" ? this.eventData.parcipiantAnswers.length : this.eventData.validatorsAnswers.length
    let index = [4, 3, 2, 1]
    if (size === 1) {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': "5px"
      }
    } else {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': (i * 10) + "px"
      }
    }
  }

  poolName() {
    return this.validation ? "TOTAL" : "CURRENT"
  }

  clickBoardName() {
    return this.validation ? "Invite friends to join as an Expert" : "share event with friends!"

  }

  async join() {
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
  }


  joinAsPlayer() {
    this.info = true;
    this.joinedAs = "player"

  }

  joinAsExpert() {
    this.info = true;
    this.joinedAs = "expert"
  }

  showEvent() {
    return this.letsJoin && this.joinedAs == undefined
  }

  showInfo() {
    return this.info && !this.goToAction;
  }

  showParticipate() {
    if (this.joinedAs !== undefined && this.goToAction) {
      return this.joinedAs == "player";
    }
  }

  showValidate() {
    if (this.joinedAs !== undefined && this.goToAction) {
      return this.joinedAs == "expert";
    }
  }

  goToInfo(from) {
    this.info = true;
    this.joinedAs = from
    this.goToAction = false;
  }

  agree() {
    this.goToAction = true;
  }

  goBack() {
    this.info = false;
    this.joinedAs = undefined;
  }

  interactionDone(data) {
    this.letsJoin = true;
    this.info = false;
    this.goToAction = false;
    this.joinedAs = undefined;
    this.interacDone.next(data);
  }

  calculateDate() {
    let startDate = new Date();
    let endTime = new Date(this.eventData.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.day = Math.floor(Math.abs(diffMs / 86400000));
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : "0" + hour;
    this.minutes = Number(minutes) > 9 ? minutes : "0" + minutes;
    if (second === 60) {
      this.seconds = "00"
    } else {
      this.seconds = second > 9 ? second : "0" + second;
    }

    const timeNow = Number((Date.now() / 1000).toFixed(0));
    if (!(this.eventData.endTime - timeNow > 0)) {
      this.validation = true;
    }
    setTimeout(() => {
      this.calculateDate()
    }, 1000);
  }

  copyToClickBoard() {
    this.copyLinkFlag = true;
    let href = window.location.hostname
    let path = href == "localhost" ? 'http://localhost:4200' : href
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`)
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }

  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = ' Validate the event result, confirming what actually happened. For Social Media events, several Experts share a portion of the prize pool. For Friends events, the Expert has 24 hours to validate and gets a custom reward from the Host.';
    modalRef.componentInstance.boldName = 'Expert - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  modalAboutPlayers() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = ' Bet on the event outcome. The prize pool is taken from loser bets and shared to winning Players, Host, Experts, and other roles.';
    modalRef.componentInstance.boldName = 'Player - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe()
    }
  }

  openComingSoonModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
  }

  validatorsNeeded() {
    return this.eventData.validatorsAmount > 0 ? this.eventData.validatorsAmount : "TBD after betting ends"
  }

  imgForEvent(data) {
    if (data && data.thumColor == 'undefined') {
      return {'background': 'url(' + data?.thumImage + ')center center no-repeat'}
    } else {
      return {'background': data?.thumColor};
    }
  }
  checkFractionalNumb(num1, num2, action) {
    if (action === '+') {
      const sum = Number(num1) + Number(num2);
      let value: string = sum.toString().includes('.') ? sum.toFixed(2) : sum.toString();

      if (value.includes('0.00')) {
        value = '<' + ' 0.01';
        return value;
      } else {
        return value;
      }
    }
  }
}
