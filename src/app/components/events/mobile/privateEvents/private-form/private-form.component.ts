import {Component, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../app.state';
import {PostService} from '../../../../../services/post.service';
import {Subscription} from 'rxjs';
import {PrivEventMobile} from '../../../../../models/PrivEventMobile.model';
import {User} from '../../../../../models/User.model';


@Component({
  selector: 'app-private-form',
  templateUrl: './private-form.component.html',
  styleUrls: ['./private-form.component.sass']
})
export class PrivateFormComponent implements OnInit, OnDestroy {
  answerForm: FormGroup;
  @Input() data: PrivEventMobile;
  formValid: boolean;
  @Output() changed = new EventEmitter<boolean>();
  userData: User;
  errorMessage = undefined;
  userSub: Subscription;
  postSub: Subscription;
  spinnerLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private postService: PostService,
  ) {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
      }
    });

    this.answerForm = formBuilder.group({
      answer: ['', Validators.required]
    });
  }

  get f() {
    return this.answerForm.controls;
  }


  ngOnInit(): void {
  }

  sendAnswer(answerForm: any) {
    if (answerForm.status === 'INVALID') {
      this.formValid = true;
      return;
    }
    const index = this.data.answers.findIndex((el => {
      return el === answerForm.value.answer;
    }));
    this.sendToDb(index);
  }

  sendToDb(answer) {
    this.spinnerLoading = true;
    let data = {
      eventId: this.data.id,
      answer: answer,
    };
    this.postSub = this.postService.post('privateEvents/participate', data).subscribe(async () => {
      this.spinnerLoading = false;
      this.betOrBackBtn(false);
      this.errorMessage = undefined;
    }, (err) => {
      this.spinnerLoading = false;
      this.errorMessage = err.toString();
      console.log(err);
    });
  }

  betOrBackBtn(increased: any) {
    this.changed.emit(increased);
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }
}
