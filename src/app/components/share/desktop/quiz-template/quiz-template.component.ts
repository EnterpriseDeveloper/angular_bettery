import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener
} from '@angular/core';
import { User } from '../../../../models/User.model';
import { Answer } from '../../../../models/Answer.model';
import Web3 from 'web3';
import * as UserActions from '../../../../actions/user.actions';
import { PostService } from '../../../../services/post.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuizErrorsComponent } from './quiz-errors/quiz-errors.component';
import { Subscription } from 'rxjs';
import { Event } from '../../../../models/Event.model';
import { Coins } from '../../../../models/Coins.model';
import { RegistrationComponent } from '../../../registration/registration/registration.component';
import { ClipboardService } from 'ngx-clipboard';
import { FormBuilder, FormGroup } from '@angular/forms';
import { connectToSign } from '../../../../contract/cosmosInit';

@Component({
  selector: 'quiz-template',
  templateUrl: './quiz-template.component.html',
  styleUrls: ['./quiz-template.component.sass']
})
export class QuizTemplateComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  allUserData: User = undefined;
  amount: number;
  answerSub: Subscription;
  validSub: Subscription;
  updateSub: Subscription;
  openIndex: number = null;
  joinPlayer: boolean = false;
  becomeExpert: boolean = false;
  details: boolean = true;
  letsBet: boolean = false;
  viewEventFinishInfo: boolean = false;
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

  constructor(
    private postService: PostService,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private _clipboardService: ClipboardService,
    private formBuilder: FormBuilder,
  ) {
    this.windowWidth = document.documentElement.clientWidth;
  }

  @HostListener('window:resize', ['$event'])
  listenScroll() {
    this.windowWidth = document.documentElement.clientWidth;
    this.heightBlock = this.div.nativeElement.clientHeight;
  }

  ngAfterViewInit() {
    if (this.question) {
      this.heightBlock = this.div.nativeElement.clientHeight;
    }
  }

  ngOnInit() {
    this.allUserData = this.userData;
    this.form = this.formBuilder.group({
      quickBet: [this.avgBet(this.question)],
    });
    this.myAnswers = this.question.usersAnswers;
    this.myAnswers.amount = this.avgBet(this.question);
  }

  findSum(count, to: number, from: number) {
    let sum = 0;
    for (let i = from; i < to; i++) {
      sum += count[i].length;
    }
    return sum;
  }

  answersStructure() {
    const length = this.question.answers.length;
    let limit;
    if (this.windowWidth >= 1650) {
      limit = 60;
    } else {
      limit = 50;
    }


    if (this.question) {
      if (this.question.answers.length === 2) {
        const sum = this.findSum(this.question.answers, this.question.answers.length, 0);
        return sum <= limit ? 'in_row' : 'in_column';
      }

      const allSum = this.findSum(this.question.answers, this.question.answers.length, 0);
      if (length !== 2 && length !== 3 && length !== 4) {
        if (allSum <= limit) {
          return 'in_row_6';
        }
      }
      const first3 = this.findSum(this.question.answers, 3, 0);
      const first2 = this.findSum(this.question.answers, 2, 0);
      if (length === 3) {
        if (allSum <= limit) {
          return 'for_1';
        }
        if (first3 <= limit) {
          return 'for_2';
        }
        return first2 <= 60 ? 'for_2' : 'in_column';
      }

      const second2 = this.findSum(this.question.answers, 4, 2);
      if (length === 4) {
        if (allSum <= limit) {
          return 'for_1';
        }
        return (first2 <= 60 && second2 <= 60) ? 'for_3' : 'in_column';
      }
      if (length === 5) {
        const last2 = this.findSum(this.question.answers, 2, 3);
        if (first3 <= limit && last2 <= limit) {
          return 'for_3';
        } else if (first2 <= limit && second2 <= limit) {
          return 'for_2';
        } else {
          return 'in_column';
        }
      }

      if (length === 6) {
        const second3 = this.findSum(this.question.answers, 6, 3);
        const third2 = this.findSum(this.question.answers, 6, 4);
        if (first3 <= limit && second3 <= limit) {
          return 'for_2';
        } else if (first2 <= 60 && second2 <= 60 && third2 <= 60) {
          return 'for_3';
        } else {
          return 'in_column';
        }
      }
    }
  }

  makeShortenStr(str: string, howMuch: number): string {
    return str.length > howMuch ? str.slice(0, howMuch) + '...' : str;
  }

  ngOnChanges(changes) {
    if (changes['userData'] !== undefined) {
      let currentValue = changes['userData'].currentValue;
      if (currentValue != undefined) {
        if (this.allUserData === undefined || currentValue._id !== this.allUserData._id) {
          this.allUserData = this.userData;
        }
      }

      if (currentValue == undefined) {
        this.question.usersAnswers = {
          event_id: null,
          answer: null,
          from: null,
          answered: null,
          amount: this.question.usersAnswers.amount,
          betAmount: null,
          mintedToken: null,
          payToken: null,
          answerName: null
        };
      }
    }
  }

  makeAnswer(i, answer) {
    this.letsRegistration();
    this.myAnswers.answer = i;
    this.myAnswers.answerName = answer
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

  biggestWin(data) {
    if (data.parcipiantAnswers != undefined) {
      let biggest = 0;
      for (let i = 0; i < data.parcipiantAnswers.length; i++) {
        const el = data.parcipiantAnswers[i].payToken + data.parcipiantAnswers[i].mintedToken;
        if (el > biggest) {
          biggest = el;
        }
      }
      return biggest.toString().includes('.') ? biggest.toFixed(1) : biggest;
    } else {
      return 0;
    }
  }

  actionDetected() {
    if (this.userData != undefined) {
      if (this.myAnswers.from == 'validator') {
        return 'You earned';
      } else {
        return 'You won';
      }
    } else {
      return;
    }
  }

  hostEarned(data) {
    if (data.host.id === this.userData._id) {
      return this.checkFractionalNumb(data.host.payHostAmount, data.host.mintedHostAmount, '+') + ' BET';
    }
  }

  playerAward() {
    if (this.userData != undefined) {
      return this.checkFractionalNumb(this.myAnswers.mintedToken, this.myAnswers.payToken, '+') + ' BET';
    } else {
      return;
    }
  }

  getLost(data) {
    if (this.userData != undefined && data) {
      const findParc = data.parcipiantAnswers.filter((x) => {
        return x.userId == this.userData._id;
      });
      return this.checkFractionalNumb(findParc[0].amount, findParc[0].mintedToken, '-');
    }
  }

  getMinted(data) {
    const sumMintedParc = data.parcipiantAnswers.reduce((sum, elem) => {
      return sum + Number(elem.mintedToken);
    }, 0);
    const sumMintedValidator = data.validatorsAnswers.reduce((sum, elem) => {
      return sum + Number(elem.mintedToken);
    }, 0);
    return this.checkFractionalNumb(sumMintedParc, sumMintedValidator, '+');
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

  getWinnerColor(data) {
    if (this.userData != undefined) {
      if (data.host.id === this.userData._id) {
        return { 'color': '#F7971E' };
      } else if (this.myAnswers.from == 'validator') {
        return { 'color': '#A134FF' };
      } else {
        return { 'color': '#10C9C9' };
      }
    } else {
      return;
    }
  }

  getPool(data) {
    let pool = 0;
    if (data.parcipiantAnswers !== undefined) {
      data.parcipiantAnswers.forEach(x => {
        pool = pool + Number(x.amount);
      });
      return pool.toString().includes('.') ? pool.toFixed(1) : pool;
    } else {
      return 0;
    }
  }

  betEvent(event) {
    event.event_id = this.question.id;
    this.setToNetwork(event);
  }

  validateEvent(event) {
    event.event_id = this.question.id;
    this.setToNetworkValidation(event);
  }

  async setAnswer(from) {
    if (this.disable === this.index) {
      return;
    }
    let answer = this.myAnswers;
    if (this.allUserData != undefined) {
      if (answer.answer === undefined) {
        let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Choose anwer';
        modalRef.componentInstance.description = 'Choose at least one answer';
        modalRef.componentInstance.nameButton = 'fine';
      } else {
        if (from === 'validate') {
          this.setToNetworkValidation(answer);
        } else {
          if (Number(answer.amount) < 0.01) {
            const modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
            modalRef.componentInstance.errType = 'error';
            modalRef.componentInstance.title = 'Low amount';
            modalRef.componentInstance.description = 'Amount must be bigger than 0.01';
            modalRef.componentInstance.nameButton = 'fine';
          } else {
            this.isDisabled();
            this.setToNetwork(answer);
          }
        }
      }
    } else {
      const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
      modalRef.componentInstance.openSpinner = true;
    }
  }

  isDisabled() {
    if (this.disable == this.index) {
      this.disable = null;
    } else {
      this.disable = this.index;
    }
  }

  async setToNetwork(answer) {
    if (Number(this.coinInfo.BET) < Number(answer.amount)) {
      let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
      modalRef.componentInstance.errType = 'error';
      modalRef.componentInstance.title = 'Insufficient BET';
      modalRef.componentInstance.description = 'You don\'t have enough BET tokens to make this bet. Please lower your bet or get more BET tokens by:';
      modalRef.componentInstance.editionDescription = ['- Hosting a successful event', '- Validating event results as an Expert', '- Giving others topics to host events as an Advisor'];
      modalRef.componentInstance.nameButton = 'fine';
      this.disable = null;
    } else {
      let web3 = new Web3();
      var _money = web3.utils.toWei(String(answer.amount), 'ether');
      let { memonic, address, client } = await connectToSign()

      const msg = {
        typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreatePartPubEvents",
        value: {
          creator: address,
          pubId: answer.event_id,
          answers: answer.answerName,
          amount: _money
        }
      };
      const fee = {
        amount: [],
        gas: "1000000",
      };
      try {
        let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
        if(transact.transactionHash && transact.code == 0){
          this.setToDB(transact.transactionHash, answer);
        }else{
          let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = 'Unknown Error';
          modalRef.componentInstance.customMessage = String(transact);
          modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
          modalRef.componentInstance.nameButton = 'report error';
          this.disable = null;
        }
      } catch (err) {
        let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Unknown Error';
        modalRef.componentInstance.customMessage = String(err.error);
        modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
        modalRef.componentInstance.nameButton = 'report error';
        this.disable = null;
      }
    }
  }

  setToDB(transactionHash, answer) {
    let data = {
      event_id: answer.event_id,
      answerIndex: answer.answer,
      amount: Number(answer.amount),
      transactionHash: "0x"+transactionHash
    };
    this.answerSub = this.postService.post('publicEvents/participate', data).subscribe(async () => {
      this.updateUser();
      this.callGetData.next();
      this.disable = null;
      this.betDisable = false;
    },
      (err) => {
        console.log(err);
        if (err.error.includes('not valid time')) {
          if (this.timePart(this.question)) {
            let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
            modalRef.componentInstance.errType = 'time';
            modalRef.componentInstance.title = 'Event not start';
            modalRef.componentInstance.customMessage = 'Betting time for this event is not start.';
            modalRef.componentInstance.description = 'Player can join when event is start.';
            modalRef.componentInstance.nameButton = 'fine';
            this.disable = null;
          } else if (this.timeValidating(this.question)) {
            let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
            modalRef.componentInstance.errType = 'time';
            modalRef.componentInstance.title = 'Betting time’s over';
            modalRef.componentInstance.customMessage = 'Betting time for this event is over.';
            modalRef.componentInstance.description = 'No more Players can join now.';
            modalRef.componentInstance.nameButton = 'fine';
            this.disable = null;
          }

        } else {
          let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = 'Unknown Error';
          modalRef.componentInstance.customMessage = String(err.error);
          modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
          modalRef.componentInstance.nameButton = 'report error';
          this.disable = null;
        }

      });
  }


  async setToNetworkValidation(answer) {
    let { memonic, address, client } = await connectToSign()
    const msg = {
      typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreateValidPubEvents",
      value: {
        creator: address,
        pubId: answer.event_id,
        answers: answer.answerName,
        reput: 1 // TODO get reput
      }
    };
    const fee = {
      amount: [],
      gas: "1000000",
    };

    console.log(msg);
    try {
      let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
      console.log(transact)
      if(transact.transactionHash && transact.code == 0){
        this.setToDBValidation(transact.transactionHash, answer);
      }else{
        let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Unknown Error';
        modalRef.componentInstance.customMessage = JSON.stringify(transact);
        modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
        modalRef.componentInstance.nameButton = 'report error';
      }
    } catch (err) {
      let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
      modalRef.componentInstance.errType = 'error';
      modalRef.componentInstance.title = 'Unknown Error';
      modalRef.componentInstance.customMessage = String(err.error);
      modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
      modalRef.componentInstance.nameButton = 'report error';
    }
  }

  setToDBValidation(transactionHash, answer) {
    let data = {
      event_id: answer.event_id,
      answer: answer.answer,
      reputation: 1, // TODO get reputation
      transactionHash: "0x"+transactionHash
    };
    this.validSub = this.postService.post('publicEvents/validate', data).subscribe(async () => {
      this.updateUser();
      this.callGetData.next();
      this.validDisable = false;
    },
      (err) => {
        console.log(err);
        // TODO change error handler
        if (err.error.includes('not valid time')) {
          if (this.timeValidating(this.question)) {
            let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
            modalRef.componentInstance.errType = 'time';
            modalRef.componentInstance.title = 'Validation time’s not start';
            modalRef.componentInstance.customMessage = 'Validation time for this event not start';
            modalRef.componentInstance.description = 'Expert can join when validating time is start';
            modalRef.componentInstance.nameButton = 'fine';
          } else if (!this.timeValidating(this.question)) {
            let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
            modalRef.componentInstance.errType = 'time';
            modalRef.componentInstance.title = 'Validation time’s over';
            modalRef.componentInstance.customMessage = 'Validation time for this event is over, ';
            modalRef.componentInstance.description = 'No more Experts can join now.';
            modalRef.componentInstance.nameButton = 'fine';
          }
        } else if (err.error.includes('user participate')) {
          let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = 'You participated in this event.';
          modalRef.componentInstance.customMessage = 'You have been like the participant in this event. ';
          modalRef.componentInstance.description = 'The participant can\'t be the Experts.';
          modalRef.componentInstance.nameButton = 'fine';
        } else {
          let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = 'Unknown Error';
          modalRef.componentInstance.customMessage = String(err.error);
          modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
          modalRef.componentInstance.nameButton = 'report error';
        }
      });
  }

  updateUser() {
    let data = {
      id: this.allUserData._id
    };
    this.updateSub = this.postService.post('user/getUserById', data)
      .subscribe(
        (currentUser: User[]) => {
          this.store.dispatch(new UserActions.UpdateUser({
            _id: currentUser[0]._id,
            email: currentUser[0].email,
            nickName: currentUser[0].nickName,
            wallet: currentUser[0].wallet,
            avatar: currentUser[0].avatar,
            verifier: currentUser[0].verifier,
            verifierId: currentUser[0].verifierId,
            sessionToken: currentUser[0].sessionToken,
            accessToken: currentUser[0].accessToken
          }));
        });
  }

  finalAnswerGuard(question) {
    if (question.finalAnswer !== null || question.status.includes('reverted')) {
      return true;
    } else if (this.myAnswers.answer != undefined && this.myAnswers.answered) {
      return true;
    } else {
      return false;
    }
  }

  timePart(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.startTime - timeNow > 0;
  }

  timeValidating(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.endTime - timeNow > 0;
  }

  cardColorBackGround(data) {
    if (data.finalAnswer !== null) {
      if (this.userData != undefined) {
        if (data.host.id === this.userData._id) {
          return { 'background': 'rgb(255, 248, 206)' };
        } else {
          return this.backgroundColorEventFinish(data);
        }
      } else {
        return this.backgroundColorEventFinish(data);
      }
    } else if (data.status.includes('reverted')) {
      return { 'background': '#F4F4F4' };
    } else {
      return { 'background': '#E6FFF2' };
    }
  }

  backgroundColorEventFinish(data) {
    if (this.userData && data.finalAnswer != this.myAnswers.answer && this.myAnswers.answer != undefined) {
      return { 'background': '#FFEDED' };
    } else {
      return { 'background': '#F4F4F4' };
    }
  }

  eventFinishDate(data) {
    let d = new Date(Number(data.eventEnd) * 1000);
    return `${d.getDate()}/${Number(d.getMonth()) + 1}/${d.getFullYear()}`;
  }

  colorForRoom(color) {
    if (this.question) {
      return {
        'background': color,
        'max-height': this.heightBlock + 'px'
      };
    } else {
      return;
    }
  }

  imageHeight() {
    if (this.question) {
      return {
        'height': this.heightBlock + 'px'
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


  getCommentById(id: any) {
    this.commentIdEmmit.emit(id);
  }

  getValidatorsAmount(q) {
    return q.validatorsAnswers == undefined ? 0 : q.validatorsAnswers.length;
  }

  calculatedJoiner(a, b) {
    if (a !== undefined && b !== undefined) {
      return a.length + b.length;
    }
    if (a === undefined && b !== undefined) {
      return b.length;
    }
    if (a !== undefined && b === undefined) {
      return a.length;
    }
    if (a === undefined && b === undefined) {
      return 0;
    }
  }

  openDetails() {
    if (this.openIndex == this.index) {
      this.openIndex = null;
    } else {
      this.openIndex = this.index;
    }
  }


  cancel() {
    this.details = false;
    this.joinPlayer = false;
    this.becomeExpert = false;
  }

  continue() {
    this.letsBet = true;
    this.details = false;
  }

  joinAsPlayer() {
    this.letsRegistration();

    this.joinPlayer = true;
    this.details = true;
  }

  becomeValidator() {
    this.letsRegistration();

    this.becomeExpert = true;
    this.details = true;
  }

  goToInfo() {
    this.letsBet = false;
    this.details = true;
  }

  viewDetails() {
    if (!this.question.status.includes('reverted')) {
      if (this.openIndex == this.index) {
        this.openIndex = null;
        this.viewEventFinishInfo = false;
      } else {
        this.openIndex = this.index;
        this.viewEventFinishInfo = true;
      }
    }
  }

  roomCardBottom() {
    if (this.openIndex != this.index) {
      return {
        'border-top-left-radius': '0px',
        'border-top-right-radius': '20px',
        'border-bottom-left-radius': '0px',
        'border-bottom-right-radius': '20px',
      };
    } else {
      return {
        'border-top-left-radius': '0px',
        'border-top-right-radius': '20px',
        'border-bottom-left-radius': '20px',
        'border-bottom-right-radius': '20px',
      };
    }
  }

  getValidatorsAmountLeft(eventData) {
    return eventData.validatorsAmount == 0 ? this.expertAmount(eventData) : eventData.validatorsAmount;
  }

  expertAmount(eventData) {
    let part = eventData.parcipiantAnswers == undefined ? 0 : eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  copyToClickBoard(eventId) {
    this.copyLinkFlag = true;
    const href = window.location.hostname;
    const path = href === 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/public_event/${eventId}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }

  ngOnDestroy() {
    if (this.answerSub) {
      this.answerSub.unsubscribe();
    }
    if (this.validSub) {
      this.validSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }

  letsRegistration() {
    if (this.allUserData === undefined) {
      const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
      modalRef.componentInstance.openSpinner = true;
    }
  }

  filterKeyCode(event) {
    return event.keyCode !== 69 && event.keyCode !== 189 && event.keyCode !== 187;
  }

  updateValue() {
    let value = this.form.controls.quickBet.value;
    if (value) {
      value = value.toString();
      if (value.indexOf('.') != '-1') {
        value = value.substring(0, value.indexOf('.') + 3);
        this.form.controls.quickBet.setValue(value);
      }
      this.myAnswers.amount = Number(value);
    }
  }

}
