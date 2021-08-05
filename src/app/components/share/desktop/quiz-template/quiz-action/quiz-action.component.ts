import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizErrorsComponent} from '../quiz-errors/quiz-errors.component';
import {Subscription} from 'rxjs';
import {User} from '../../../../../models/User.model';
import {RegistrationComponent} from '../../../../registration/registration.component';
import {FormBuilder, FormGroup} from '@angular/forms';


@Component({
  selector: 'quiz-action',
  templateUrl: './quiz-action.component.html',
  styleUrls: ['./quiz-action.component.sass']
})
export class QuizActionComponent implements OnInit{
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
  // amount: number = 0;
  torusSub: Subscription;
  storeUserSubscribe: Subscription;
  limitAmount: boolean;
  form: FormGroup;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
  ) {
  }
  ngOnInit() {
    this.form = this.formBuilder.group({
      amount: [0],
    });

    let valid = this.question.validatorsAnswers == undefined ? 0 : this.question.validatorsAnswers.length;
    let validLeft = this.getValidatorsAmountLeft(this.question);
    this.isDisableValid = valid >= validLeft ? true : false;
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

  async makeAnswer(i) {
    this.answerNumber = i;
  }

  async participate() {
    if (this.isDisableBet) {
      return;
    }
    if (Number(this.form.controls.amount.value) < 0.01) {
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
        modalRef.componentInstance.description = "Choose at least one answer";
        modalRef.componentInstance.nameButton = "fine";
      } else {
        if (Number(this.form.controls.amount.value) <= 0) {
          const modalRef = this.modalService.open(QuizErrorsComponent, { centered: true });
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = "Low amount";
          modalRef.componentInstance.description = "Amount must be bigger than 0";
          modalRef.componentInstance.nameButton = "fine";
        } else {
          let data: any = {
            amount: this.form.controls.amount.value,
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
        modalRef.componentInstance.description = 'Choose at least one answer';
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

  updateValue() {
    let value = this.form.controls.amount.value;
    if (value) {
      value = value.toString();
      if (value.indexOf('.') != '-1') {
        value = value.substring(0, value.indexOf('.') + 3);
        this.form.controls.amount.setValue(value);
      }
    }
  }
}
