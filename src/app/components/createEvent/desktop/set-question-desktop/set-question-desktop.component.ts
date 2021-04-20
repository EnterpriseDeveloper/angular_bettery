import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { PostService } from '../../../../services/post.service';
import { Subscription } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../../../models/User.model';
import { RegistrationComponent } from '../../../registration/registration.component';

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
      question: [this.formData.question, Validators.required],
      answers: new FormArray([]),
      details: [this.formData.resolutionDetalis]
    });

    this.answesQuantity = this.formData.answers.length == 0 ? 2 : this.formData.answers.length;

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
      this.getData.next(this.questionForm.value);
    } else {
      this.loginWithTorus();
    }

  }

  async loginWithTorus() {
    this.clicked = true;
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}

