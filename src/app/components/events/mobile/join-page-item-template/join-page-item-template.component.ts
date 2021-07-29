import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../../../models/User.model';
import {Subscription} from 'rxjs';
import {Event} from '../../../../models/Event.model';
import {Answer} from '../../../../models/Answer.model';
import {Coins} from '../../../../models/Coins.model';
import {FormGroup} from '@angular/forms';

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
  becomeExpert = false;
  details = true;
  letsBet = false;
  viewEventFinishInfo = false;
  copyLinkFlag: boolean;

  @Input() joinRoom: boolean;
  @Input() index: number;
  @Input() question: Event;
  @Input('userData') userData: User;
  myAnswers: Answer;
  @Input() coinInfo: Coins;
  @Input() fromComponent: string;

  @Output() callGetData = new EventEmitter();
  @Output() commentIdEmmit = new EventEmitter<number>();
  @ViewChild('div') div: ElementRef;
  heightBlock: number;
  disable: number = null;
  validDisable = false;
  betDisable = false;
  windowWidth: number;
  form: FormGroup;


  constructor() {
  }

  ngOnInit(): void {
    console.log(this.question);
  }

  toggleDetailOpened() {
    this.question.detailOpened = !this.question.detailOpened;
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
  statusReverted(data) {
    let x = data.status.replace('reverted:', '');
    if (x.search('not enough experts') != -1) {
      return x + ' (' + this.getValidatorsAmount(data) + '/' + this.getValidatorsAmountLeft(data) + ')';
    } else {
      return x;
    }
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

}
