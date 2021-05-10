import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizErrorsComponent} from '../quiz-errors/quiz-errors.component';
import {Subscription} from 'rxjs';
import {User} from '../../../../models/User.model';
import {RegistrationComponent} from '../../../registration/registration.component';


@Component({
  selector: 'quiz-action',
  templateUrl: './quiz-action.component.html',
  styleUrls: ['./quiz-action.component.sass']
})
export class QuizActionComponent {
  @Input() question: any;
  @Input() joinPlayer: boolean;
  @Input() becomeExpert: boolean;
  @Input() allUserData: User;
  @Input()  isDisableValid: boolean;
  @Input()  isDisableBet: boolean;
  @Output() goBack = new EventEmitter();
  @Output() betEvent = new EventEmitter<Array<any>>();
  @Output() validateEvent = new EventEmitter<Array<any>>();

  answerNumber: number = null;
  amount: number = 0;
  torusSub: Subscription;
  storeUserSubscribe: Subscription;
  limitAmount: boolean;

  constructor(
    private modalService: NgbModal,
  ) {
  }

  async makeAnswer(i) {
    this.answerNumber = i;
  }

  async participate() {
    if (this.isDisableBet) {
      return;
    }
    if (this.amount < 0.01) {
      this.limitAmount =  true;
      return;
    } else {
      this.limitAmount = false;
    }
    if (this.allUserData != undefined) {
      if (this.answerNumber === null) {
        let modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = "Choose anwer";
        modalRef.componentInstance.description = "Choose at leas one answer";
        modalRef.componentInstance.nameButton = "fine";
      } else {
        if (Number(this.amount) <= 0) {
          const modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = "Low amount";
          modalRef.componentInstance.description = "Amount must be bigger than 0";
          modalRef.componentInstance.nameButton = "fine";
        } else {
          let data: any = {
            amount: this.amount,
            answer: this.answerNumber
          }
          this.isDisableBet = true;
          this.betEvent.next(data);
        }

      }
    } else {
      const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
      modalRef.componentInstance.openSpinner = true;
    }
  }

  async validate() {
    if (this.isDisableValid) {
      return;
    }
    if (this.allUserData != undefined) {
      if (this.answerNumber === null) {
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Choose anwer';
        modalRef.componentInstance.description = 'Choose at leas one answer';
        modalRef.componentInstance.nameButton = 'fine';
      } else {
        let data: any = {
          answer: this.answerNumber
        };
        this.isDisableValid = true;
        this.validateEvent.next(data);
      }
    } else {
      const modalRef = this.modalService.open(RegistrationComponent, {centered: true});
      modalRef.componentInstance.openSpinner = true;
    }
  }

  cancel() {
    this.goBack.next();
  }

  getBackground(i) {
    if (this.joinPlayer) {
      return {
        'background': this.answerNumber == i ? '#34DDDD' : '#EBEBEB'
      };
    } else {
      return {
        'background': this.answerNumber == i ? '#BF94E4' : '#EBEBEB'
      };
    }
  }

  filterKeyCode(event) {
    this.limitAmount = false;
    return event.keyCode !== 69 && event.keyCode !== 189 && event.keyCode !== 187;
  }
}
