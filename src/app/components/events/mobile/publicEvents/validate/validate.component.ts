import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard'
import { PostService } from '../../../../../services/post.service';
import _ from "lodash";
import { Subscription } from 'rxjs';
import { User } from '../../../../../models/User.model';
import { PubEventMobile } from '../../../../../models/PubEventMobile.model';

@Component({
  selector: 'validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.sass']
})
export class ValidateComponent implements OnInit, OnDestroy {
  @Input() eventData: PubEventMobile;
  @Output() goBack = new EventEmitter();
  @Output() goViewStatus = new EventEmitter<number>();
  timeIsValid: boolean;
  submitted: boolean = false;
  spinnerLoading: boolean = false;

  answerForm: FormGroup;
  errorMessage: string;
  userData: User;
  hour: number | string;
  minutes: number | string;
  seconds: number | string;
  userSub: Subscription;
  postSub: Subscription;

  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private postService: PostService,
    private _clipboardService: ClipboardService
  ) {
    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0]
      }
    });
  }

  ngOnInit(): void {
    this.checkTimeIsValid();
    this.answerForm = this.formBuilder.group({
      answer: ["", Validators.required],
    })
  }

  get f() {
    return this.answerForm.controls;
  }

  playersAmount() {
    return this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length
  }

  checkTimeIsValid() {
    let time = Number((Date.now() / 1000).toFixed(0))
    this.timeIsValid = this.eventData.endTime - time > 0;
    if (this.timeIsValid) {
      this.calculateDate()
    }
  }

  calculateDate() {
    let startDate = new Date();
    let endTime = new Date(this.eventData.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : "0" + hour;
    this.minutes = Number(minutes) > 9 ? minutes : "0" + minutes;
    if (second === 60) {
      this.seconds = "00"
    } else {
      this.seconds = second > 9 ? second : "0" + second;
    }
    setTimeout(() => {
      this.calculateDate()
    }, 1000);
  }

  cancel() {
    this.goBack.next();
  }

  copyToClickBoard() {
    let href = window.location.hostname
    let path = href == "localhost" ? 'http://localhost:4200' : href
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`)
  }

  remainderExperts() {
    let expertDone = this.eventData.validatorsAnswers == undefined ? 0 : this.eventData.validatorsAnswers.length
    let epxertIn = this.eventData.validatorsAmount == 0 ? this.expertAmount() : this.eventData.validatorsAmount
    return epxertIn - expertDone;
  }

  expertAmount() {
    let part = this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  validate() {
    this.submitted = true;
    if (this.answerForm.invalid) {
      return
    }
    this.setToDBValidation(this.eventData)
  }

  setToDBValidation(dataAnswer) {
    this.spinnerLoading = true;
    var _whichAnswer = _.findIndex(this.eventData.answers, (o) => { return o == this.answerForm.value.answer; });
    let data = {
      event_id: dataAnswer.id,
      answer: _whichAnswer,
    }
    this.postSub = this.postService.post('publicEvents/validate', data).subscribe(async () => {
      this.errorMessage = undefined;
      this.spinnerLoading = false;
      this.viewStatus();
    },
      (err) => {
        this.spinnerLoading = false;
        this.errorMessage = String(err.error);
        console.log(err)
      })
  }

  viewStatus() {
    this.goViewStatus.next(this.eventData.id);
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
