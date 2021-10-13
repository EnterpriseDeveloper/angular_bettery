import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../../../models/User.model';
import {Subscription} from 'rxjs';
import {Event} from '../../../../models/Event.model';
import {Answer} from '../../../../models/Answer.model';
import {Coins} from '../../../../models/Coins.model';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {ClipboardService} from "ngx-clipboard";
import {ImageOpenViewComponent} from "../../../share/desktop/image-open-view/image-open-view.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-join-page-item-template',
  templateUrl: './join-page-item-template.component.html',
  styleUrls: ['./join-page-item-template.component.sass']
})
export class JoinPageItemTemplateComponent implements OnInit {

  allUserData: User = undefined;
  amount: number;
  answerSub: Subscription;
  validSub: Subscription;
  updateSub: Subscription;
  openIndex: number = null;
  joinPlayer = false;
  details = true;
  copyLinkFlag: boolean;
  addCloseAnimation: boolean;
  showDetailWindow = true;

  @Input() joinRoom: boolean;
  @Input() index: number;
  @Input() question: Event;
  @Input('userData') userData: User;
  myAnswers: Answer;
  @Input() coinInfo: Coins;
  @Input() fromComponent: string;
  @ViewChild('eventImage') eventImage: ElementRef;

  @Output() callGetData = new EventEmitter();
  @Output() commentIdEmmit = new EventEmitter<number>();
  @Output() isDetailOpened = new EventEmitter();
  heightBlock: number;
  disable: number = null;
  validDisable = false;
  betDisable = false;
  windowWidth: number;
  form: FormGroup;
  showClearImage = false;

  constructor(private router: Router,
              private _clipboardService: ClipboardService,
              private modalService: NgbModal
  ) {

  }

  ngOnInit(): void {
    this.addCloseAnimation = !this.question.detailOpened;
  }


  toggleDetailOpened($event) {
    $event.stopPropagation();
    this.question.detailOpened = !this.question.detailOpened;
    this.toggleItemInTempArr();
    this.toggleCloseAnimation();
  }

  toggleItemInTempArr() {
    if (this.question.detailOpened) {
      this.isDetailOpened.emit({isOpened: true, index: this.index});

    } else if (!this.question.detailOpened) {
      this.isDetailOpened.emit({isOpened: false, index: this.index});
    }
  }

  toggleImage() {
    this.showClearImage = !this.showClearImage;
    this.showClearImage ? this.eventImage.nativeElement.src = this.question.thumFinish : this.eventImage.nativeElement.src = this.question.thumImage;

  }

  colorForRoom(color) {
    if (this.question) {
      return {
        background: color,
        'max-height': this.heightBlock + 'px'
      };
    } else {
      return;
    }
  }

  copyToClickBoard($event, eventId) {
    $event.preventDefault();
    this.copyLinkFlag = true;
    const href = window.location.hostname;
    const path = href === 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/public_event/${eventId}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }
  avgBet(q) {
    let amount = 0;
    if (q.parcipiantAnswers == undefined) {
      return amount;
    } else {
      q.parcipiantAnswers.forEach(e => {
        amount = amount + e.amount;
      });
    }
    return this.checkFractionalNumb(amount, q.parcipiantAnswers.length, '/');
  }

  checkFractionalNumb(num1, num2, action) {
    if (action === '+') {
      const sum = Number(num1) + Number(num2);
      return sum.toString().includes('.') ? sum.toFixed(2) : sum;
    }
    if (action === '-') {
      const difference = Number(num1) - Number(num2);
      return difference.toString().includes('.') ? difference.toFixed(1) : difference;
    }
    if (action === '/') {
      const avg = Number(num1) / Number(num2);
      return avg.toString().includes('.') ? avg.toFixed(1) : avg;
    }
  }

  timeValidating(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.endTime - timeNow > 0;
  }

  getValidatorsAmount(q) {
    return q.validatorsAnswers === undefined ? 0 : q.validatorsAnswers.length;
  }

  getValidatorsAmountLeft(eventData) {
    return eventData.validatorsAmount == 0 ? this.expertAmount(eventData) : eventData.validatorsAmount;
  }

  expertAmount(eventData) {
    const part = eventData.parcipiantAnswers == undefined ? 0 : eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  makeShortenStr(str: string, howMuch: number): string {
    return str.length > howMuch ? str.slice(0, howMuch) + '...' : str;
  }

  toggleCloseAnimation() {
    this.addCloseAnimation = !this.addCloseAnimation;
    this.question.detailOpened = !this.addCloseAnimation;
  }

  navToEvent(){
    this.router.navigate([]).then(result => {window.open('/public_event/' + this.question.id.toString(),'_blank')});
  }

  arrowType(question: Event) {

    if ((question.status == 'finished') && question.usersAnswers.from == 'validator') {
      this.showDetailWindow = false;
      return 'item_open_arrow_purple';
    }
    if ((question.status == 'finished') && question.usersAnswers.from == 'participant' && this.userData._id === question.host.id) {
      this.showDetailWindow = false;
      return 'item_open_arrow_yellow';
    }
    if ((question.status == 'finished') && question.usersAnswers.from == 'participant' && this.userData._id != question.host.id) {
      this.showDetailWindow = false;
      return 'item_open_arrow_blue';
    }
    if ((question.status == 'finished' || question.status.includes('reverted'))) {
      this.showDetailWindow = false;
      return 'item_open_arrow_white';
    }
  }
  open() {
    const modal = this.modalService.open(ImageOpenViewComponent, {centered: true, windowClass: 'modal-content-zoom', backdrop: true});
    modal.componentInstance.imageSrc = this.question.thumImage;
  }
}
