import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { PostService } from '../../../../../services/post.service';
import { Subscription } from 'rxjs';
import { User } from '../../../../../models/User.model';
import { PubEventMobile } from '../../../../../models/PubEventMobile.model';
import { connectToSign } from '../../../../../contract/cosmosInit';
import {ReputationModel} from '../../../../../models/Reputation.model';


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
  submitted = false;
  spinnerLoading = false;

  answerForm: FormGroup;
  errorMessage: string;
  userData: User;
  reputation: ReputationModel;
  hour: number | string;
  minutes: number | string;
  seconds: number | string;
  userSub: Subscription;
  postSub: Subscription;
  reputationSub: Subscription;

  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private postService: PostService,
    private _clipboardService: ClipboardService
  ) {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
      }
    });
    this.reputationSub = this.store.select('reputation').subscribe((x: ReputationModel) => {
      if (x) {
        this.reputation = x;
      }
    });
  }

  ngOnInit(): void {
    this.checkTimeIsValid();
    this.answerForm = this.formBuilder.group({
      answer: ['', Validators.required],
    });
  }

  get f() {
    return this.answerForm.controls;
  }

  playersAmount() {
    return this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length;
  }

  checkTimeIsValid() {
    const time = Number((Date.now() / 1000).toFixed(0));
    this.timeIsValid = this.eventData.endTime - time > 0;
    if (this.timeIsValid) {
      this.calculateDate();
    }
  }

  calculateDate() {
    const startDate = new Date();
    const endTime = new Date(this.eventData.endTime * 1000);
    const diffMs = (endTime.getTime() - startDate.getTime());
    const hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    const minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    const second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : '0' + hour;
    this.minutes = Number(minutes) > 9 ? minutes : '0' + minutes;
    if (second === 60) {
      this.seconds = '00';
    } else {
      this.seconds = second > 9 ? second : '0' + second;
    }
    setTimeout(() => {
      this.calculateDate();
    }, 1000);
  }

  cancel() {
    this.goBack.next();
  }

  copyToClickBoard() {
    const href = window.location.hostname;
    const path = href == 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`);
  }

  remainderExperts() {
    const expertDone = this.eventData.validatorsAnswers == undefined ? 0 : this.eventData.validatorsAnswers.length;
    const epxertIn = this.eventData.validatorsAmount == 0 ? this.expertAmount() : this.eventData.validatorsAmount;
    return epxertIn - expertDone;
  }

  expertAmount() {
    const part = this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  async validate() {
    this.submitted = true;
    if (this.answerForm.invalid) {
      return;
    }
    const { memonic, address, client } = await connectToSign();

    const msg = {
      typeUrl: '/VoroshilovMax.bettery.publicevents.MsgCreateValidPubEvents',
      value: {
        creator: address,
        pubId: this.eventData.id,
        answers: this.answerForm.value.answer,
        reput: this.reputation.expertRep
      }
    };
    console.log(msg,'message');
    const fee = {
      amount: [],
      gas: '1000000',
    };
    try {
      const transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
      if (transact.transactionHash && transact.code == 0){
        this.setToDBValidation(this.eventData, transact.transactionHash);
      }else{
        this.spinnerLoading = false;
        this.errorMessage = String(transact);
      }
    } catch (err) {
      this.spinnerLoading = false;
      this.errorMessage = String(err.error);
    }
  }

  setToDBValidation(dataAnswer, transactionHash) {
    this.spinnerLoading = true;
    const _whichAnswer = this.eventData.answers.findIndex((o) => o == this.answerForm.value.answer);
    const data = {
      event_id: dataAnswer.id,
      answer: _whichAnswer,
      reputation: this.reputation.expertRep,
      transactionHash: '0x' + transactionHash
    };
    this.postSub = this.postService.post('publicEvents/validate', data).subscribe(async () => {
      this.errorMessage = undefined;
      this.spinnerLoading = false;
      this.viewStatus();
    },
      (err) => {
        this.spinnerLoading = false;
        this.errorMessage = String(err.error);
        console.log(err);
      });
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
    if (this.reputationSub){
      this.reputationSub.unsubscribe();
    }
  }

}
