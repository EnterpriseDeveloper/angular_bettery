import {Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../../../models/User.model';
import {RegistrationComponent} from '../../../registration/registration.component';
import {Router} from '@angular/router';
import {formDataAction} from '../../../../actions/newEvent.actions';

@Component({
  selector: 'set-question-tab',
  templateUrl: './set-question-tab.component.html',
  styleUrls: ['./set-question-tab.component.sass']
})

export class SetQuestionTabComponent implements OnInit, OnDestroy {
  formData;
  questionForm: FormGroup;
  answesQuantity: number;
  submitted = false;
  registered = false;
  clicked = false;
  userSub: Subscription;
  eventFromLandingSubscr: Subscription;
  formDataSubscribe: Subscription;

  spinnerLoading: boolean;
  saveUserLocStorage = [];
  isLimit: boolean;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChildren('answers') answers: QueryList<any>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private http: PostService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.formDataSubscribe = this.store.select('createEvent').subscribe(value => {
      this.formData = value?.formData;
    });
  }

  ngOnInit(): void {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x && x.length != 0) {
        this.formDataSubscribe = this.store.select('createEvent').subscribe(value => {
          this.formData = value?.formData;
        });
        this.registered = true;
        if (this.clicked) {
          this.onSubmit();
        }
      }
    });
    this.questionForm = this.formBuilder.group({
      question: [this.formData.question, Validators.compose([Validators.required, Validators.maxLength(120)])],
      answers: new FormArray([]),
      details: [this.formData?.resolutionDetalis]
    });

    this.answesQuantity = this.formData?.answers.length == 0 ? 2 : this.formData?.answers.length;

    for (let i = this.t.length; i < this.answesQuantity; i++) {
      if (this.formData.answers.length != 0) {
        this.t.push(this.formBuilder.group({
          name: [this.formData.answers[i].name, Validators.compose([Validators.required, Validators.maxLength(60)])],
        }));
      } else {
        this.t.push(this.formBuilder.group({
          name: ['', Validators.compose([Validators.required, Validators.maxLength(60)])],
        }));
      }
    }

    // this.eventFromLandingSubscr = this.store.select('createEvent').subscribe(a => {
    //   if (a?.newEvent.trim().length > 0) {
    //     this.formData.question = a.newEvent.trim();
    //   }
    // });
    setTimeout(() => {
      this.updateTextarea();
    });
  }

  updateTextarea() {
    this.textareaGrow();
    for (let i = 0; i < this.f.answers.value.length; i++) {
      this.textareaGrowAnswer(i);
    }
  }

  get f() {
    return this.questionForm.controls;
  }

  get t() {
    return this.f.answers as FormArray;
  }

  oneMoreAnswer() {
    if (this.t.length >= 6) {
      return;
    }
    this.t.push(this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
    }));
    this.answesQuantity = this.answesQuantity + 1;
  }

  // delete one answer from the form
  deleteAnswer(index) {
    this.t.removeAt(index);
    this.answesQuantity = this.answesQuantity - 1;
  }

  styleButtonBox() {
    if (this.answesQuantity >= 3) {
      return {
        'position': 'relative'
      };
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.questionForm.invalid || this.checkingEqual(null, 'check')) {
      return;
    }
    if (this.registered) {
      this.formData.question = this.questionForm.value.question;
      this.formData.answers = this.questionForm.value.answers;
      this.formData.resolutionDetalis = this.questionForm.value.details;
      this.store.dispatch(formDataAction({formData: this.formData}));
      this.router.navigate(['/create-room']);
    } else {
      this.loginWithTorus();
    }
  }

  async loginWithTorus() {
    this.clicked = true;
    const modalRef = this.modalService.open(RegistrationComponent, {centered: true});
    modalRef.componentInstance.openSpinner = true;
  }

  goBackToHome() {
    this.formData.question = '';
    this.formData.answers = [];
    this.store.dispatch(formDataAction({formData: this.formData}));
    this.router.navigate(['/']);
  }

  limitError(param, i) {
    if (param == 'question') {
      const length = this.f.question.value.length;
      this.isLimit = length > 115;
    }
    if (param === 'answer' && this.f.answers.value[i].name.length >= 55) {
      return 'answer' + i;
    }
  }

  textareaGrow(): void {
    this.calculateRows(this.textarea);
  }

  textareaGrowAnswer(i): void {
    const el = this.answers.toArray()[i];
    this.calculateRows(el);
  }

  calculateRows(el) {
    const paddingTop = parseInt(getComputedStyle(el.nativeElement).paddingTop, 10);
    const paddingBottom = parseInt(getComputedStyle(el.nativeElement).paddingBottom, 10);
    const lineHeight = parseInt(getComputedStyle(el.nativeElement).lineHeight, 10);
    el.nativeElement.rows = 1;
    const innerHeight = el.nativeElement.scrollHeight - paddingTop - paddingBottom;
    el.nativeElement.rows = innerHeight / lineHeight;
  }

  letsSlice(control, start, finish) {
    return finish === null ? control.slice(start) : control.slice(start, finish);
  }

  colorError(length, numYel, numMain) {
    if (length > numYel && length <= numMain) {
      return {
        'color': '#7d7d7d'
      };
    }
    if (length > numMain) {
      return {
        'color': '#FF3232'
      };
    }
  }

  checkingEqual(value, status) {
    const valueArr = this.f.answers.value.map((item) => {
      return item.name.trim();
    });
    const result = (valueArr.filter((item, index) => valueArr.indexOf(item) != index));
    if (status === 'check') {
      return result.length !== 0;
    }
    if (value !== null) {
      const arr = valueArr.filter((el) => {
        return el.trim() === value.trim() && value.trim().length !== 0;
      });
      return this.submitted && result.length !== 0 && arr.length > 1;
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.formDataSubscribe) {
      this.formDataSubscribe.unsubscribe();
    }
  }
}
