import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import _ from "lodash";
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import Contract from "../../../../../contract/contract";
import { PostService } from '../../../../../services/post.service';
import { Subscription } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../../../share/info-modal/info-modal.component'

@Component({
  selector: 'app-private-expert',
  templateUrl: './private-expert.component.html',
  styleUrls: ['./private-expert.component.sass']
})
export class PrivateExpertComponent implements OnInit, OnDestroy {
  answerForm: FormGroup;
  @Input() allTime: any;
  @Input() data: any;
  @Output() changed = new EventEmitter<boolean>();
  @Output() changed2 = new EventEmitter<boolean>();
  spinnerLoading: boolean = false;
  join: boolean;
  confirm: boolean;
  ifTimeValid: boolean;
  formValid: boolean;
  errorMessage = undefined;
  userSub: Subscription;
  postSub: Subscription;
  userData;
  date;
  month;
  year;
  hour;
  minutes;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private postService: PostService,
    private modalService: NgbModal
  ) {
    this.userSub = this.store.select('user').subscribe((x) => {
      if (x.length != 0) {
        this.userData = x[0];
      }
    });

    this.answerForm = formBuilder.group({
      answer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.calculateDate();
  }

  isConfirm() {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    this.join = true;
    if (this.data.endTime - timeNow > 0) {
      this.ifTimeValid = false;
    } else {
      this.ifTimeValid = true;
    }
  }

  isConfirm2(answerForm: any) {
    if (answerForm.status === 'INVALID') {
      this.formValid = true;
      return;
    }
    const index = _.findIndex(this.data.answers, (el => { return el === answerForm.value.answer; }));
    this.sendToBlockchain(index);
  }

  // TO DO
  modalAboutExpert(){
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = "Event with outcomes is about what matter and happen to participants. When outcome happens for real, some believe they know the truth and are willing to vote for it. They are experts - unlike risk-taking players who bet, experts don't take risk and always receive a small reward.";
    modalRef.componentInstance.boldName = 'Who are experts?';
    modalRef.componentInstance.link = 'Learn more about roles on Bettery';
  }

  get f() { return this.answerForm.controls; }

  async sendToBlockchain(answer) {
    this.spinnerLoading = true;
    let id = this.data.id
    let wallet = this.userData.wallet
    let verifier = this.userData.verifier
    let contract = new Contract();
    let contr = await contract.privateEventContract()
    let validator = await contr.methods.timeAnswerValidation(id).call();
    switch (Number(validator)) {
      case 2:
        try {
          let transaction = await contract.validateOnPrivateEvent(id, answer, wallet, verifier);
          if (transaction.transactionHash !== undefined) {
            this.sendToDb(transaction.transactionHash, answer)
          }
        } catch (error) {
          this.spinnerLoading = false;
          console.log(error);
        }
        break;
      case 1:
        this.spinnerLoading = false;
        this.errorMessage = "Event not started yeat."
        break;
      case 0:
        this.spinnerLoading = false;
        this.errorMessage = "Time for validation started yeat"
        break;
    }
  }

  sendToDb(txHash, answer) {
    let data = {
      eventId: this.data.id,
      date: new Date(),
      answer: this.answerForm.value.answer,
      answerNumber: answer,
      transactionHash: txHash,
      from: this.userData._id,
    }
    this.postSub = this.postService.post("privateEvents/validate", data).subscribe(async () => {
      this.spinnerLoading = false
      this.errorMessage = undefined;
      this.confirm = true;
    }, (err) => {
      this.spinnerLoading = false
      console.log(err)
    })
  }

  change(increased: any) {
    this.changed.emit(increased);
  }

  change2(increased: any) {
    this.changed2.emit(increased);
  }

  calculateDate() {
    let endTime = new Date(this.data.endTime * 1000);
    this.date = endTime.getDate() >= 10 ? endTime.getDate() : "0" + endTime.getDate();
    let month = endTime.getMonth();
    var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    this.month = monthtext[month];
    this.year = endTime.getFullYear();
    this.hour = endTime.getHours() >= 10 ? endTime.getHours() : "0" + endTime.getHours();
    this.minutes = endTime.getMinutes() >= 10 ? endTime.getMinutes() : "0" + endTime.getMinutes();
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