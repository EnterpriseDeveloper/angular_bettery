import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef, ViewChildren, QueryList, AfterViewInit,
} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../../../models/User.model';
import {RegistrationComponent} from '../../../registration/registration.component';

@Component({
  selector: 'set-question-desktop',
  templateUrl: './set-question-desktop.component.html',
  styleUrls: ['./set-question-desktop.component.sass']
})
export class SetQuestionDesktopComponent implements OnInit, OnDestroy {
  @Input() formData;
  @Output() getData = new EventEmitter<Object[]>();

  questionForm: FormGroup;
  answesQuantity: number;
  submitted = false;
  registered = false;
  clicked = false;
  userSub: Subscription;
  isLimit: boolean;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChildren('answers') answers: QueryList<any>;
  isDuplicate: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private http: PostService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {
  }

  ngOnInit(): void {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.registered = true;
        if (this.clicked) {
          this.onSubmit();
        }
      }
    });
    this.questionForm = this.formBuilder.group({
      question: [this.formData.question, Validators.compose([Validators.required, Validators.maxLength(120)])],
      answers: new FormArray([]),
      details: [this.formData.resolutionDetalis]
    });

    this.answesQuantity = this.formData.answers.length == 0 ? 2 : this.formData.answers.length;

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
    setTimeout(() => {
      this.textareaGrow();
    });
  }

  get f() {
    return this.questionForm.controls;
  }

  get t() {
    return this.f.answers as FormArray;
  }

  oneMoreAnswer() {
    this.t.push(this.formBuilder.group({
      name: ['', Validators.required],
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
    if (this.questionForm.invalid || this.checkingSameAnswers(null, null, null)) {
      return;
    }
    if (this.registered) {
      this.getData.next(this.questionForm.value);
    } else {
      this.loginWithTorus();
    }
  }

  async loginWithTorus() {
    this.clicked = true;
    const modalRef = this.modalService.open(RegistrationComponent, {centered: true});
    modalRef.componentInstance.openSpinner = true;
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

  checkingSameAnswers(arg1, arg2, status) {
    const valueArr = this.f.answers.value.map((item) => {
      return item.name;
    });
    this.isDuplicate = valueArr.some((item, idx) => {
      return valueArr.indexOf(item) !== idx;
    });
    if (arg1 == null && arg2 == null) {
      return this.isDuplicate;
    } else if ( status === 'question') {
      return !!(arg1 && arg2);
    } else {
      return !!(arg1 && arg2 || arg1 && this.isDuplicate);
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}


