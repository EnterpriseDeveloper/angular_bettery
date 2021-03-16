import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../../../models/User.model';
import {RegistrationComponent} from '../../../registration/registration.component';
import {Router} from "@angular/router";
import {formDataAction} from "../../../../actions/newEvent.actions";

@Component({
  selector: 'set-question-tab',
  templateUrl: './set-question-tab.component.html',
  styleUrls: ['./set-question-tab.component.sass']
})

export class SetQuestionTabComponent implements OnInit, OnDestroy {
  formData;
  questionForm: FormGroup;
  answesQuantity: number;
  faPlus = faPlus;
  submitted = false;
  registered = false;
  clicked = false;
  userSub: Subscription;
  eventFromLandingSubscr: Subscription;
  formDataSubscribe: Subscription;

  spinnerLoading: boolean;
  saveUserLocStorage = [];


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
      question: [this.formData?.question, Validators.required],
      answers: new FormArray([]),
      details: [this.formData?.resolutionDetalis]
    });

    this.answesQuantity = this.formData?.answers.length == 0 ? 2 : this.formData?.answers.length;

    for (let i = this.t.length; i < this.answesQuantity; i++) {
      if (this.formData.answers.length != 0) {
        this.t.push(this.formBuilder.group({
          name: [this.formData.answers[i].name, Validators.required],
        }));
      } else {
        this.t.push(this.formBuilder.group({
          name: ['', Validators.required],
        }));
      }
    }

    // this.eventFromLandingSubscr = this.store.select('createEvent').subscribe(a => {
    //   if (a?.newEvent.trim().length > 0) {
    //     this.formData.question = a.newEvent.trim();
    //   }
    // });
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
    if (this.registered) {
      this.submitted = true;
      if (this.questionForm.invalid) {
        return;
      }
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

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.formDataSubscribe) {
      this.formDataSubscribe.unsubscribe();
    }
  }
}
