import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../app.state';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ClipboardService} from 'ngx-clipboard'
import Web3 from "web3"
import {PostService} from '../../../../../services/post.service';
import * as CoinsActios from '../../../../../actions/coins.actions';
import {Subscription} from 'rxjs';
import {PubEventMobile} from '../../../../../models/PubEventMobile.model';
import {User} from '../../../../../models/User.model';
import {Coins} from '../../../../../models/Coins.model';
import {connectToSign} from '../../../../../contract/cosmosInit';
import {GetService} from "../../../../../services/get.service"

@Component({
  selector: 'participate',
  templateUrl: './participate.component.html',
  styleUrls: ['./participate.component.sass',
  '../event-start/event-start.component.sass'
  ]
})
export class ParticipateComponent implements OnInit, OnDestroy {
  @Input() eventData: PubEventMobile;
  @Input() inputForm: FormGroup;
  @Output() goBack = new EventEmitter();
  @Output() goViewStatus = new EventEmitter<number>();
  userData: User;
  answerForm: FormGroup;
  coinType: string;
  submitted: boolean = false;
  spinnerLoading: boolean = false;
  errorMessage: string;
  coinInfo: Coins;
  userSub: Subscription;
  coinsSub: Subscription;
  postSub: Subscription;
  balanceSub: Subscription;

  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private _clipboardService: ClipboardService,
    private postService: PostService,
    private GetService: GetService
  ) {
    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0]
      }
    });
    this.coinsSub = this.store.select("coins").subscribe((x: Coins[]) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    })
  }

  ngOnInit(): void {
    this.coinType = this.eventData.currencyType == "token" ? "BET" : "ETH"
    this.answerForm = this.formBuilder.group({
      answer: ["", Validators.required],
      amount: ["", [Validators.required, Validators.min(this.coinType == 'BET' ? 0.01 : 0.01)]]
    });

    if (this.inputForm.valid && this.inputForm.controls.answer.value) {
      this.answerForm.setValue({
        ...this.answerForm.value,
        answer: this.inputForm.controls.answer.value
      });
    }
  }

  get f() {
    return this.answerForm.controls;
  }

  copyToClickBoard() {
    let href = window.location.hostname
    let path = href == "localhost" ? 'http://localhost:4200' : href
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`)
  }

  cancel() {
    this.goBack.next();
  }

  bet() {
    this.submitted = true;
    if (this.answerForm.invalid) {
      return;
    }
    this.sendToDemon()
  }

  async sendToDemon() {
    if (Number(this.coinInfo.BET) < Number(this.answerForm.value.amount)) {
      return;
    } else {
      this.spinnerLoading = true;
      let web3 = new Web3();
      var _money = web3.utils.toWei(String(this.answerForm.value.amount), 'ether')
      let {memonic, address, client} = await connectToSign()

      const msg = {
        typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreatePartPubEvents",
        value: {
          creator: address,
          pubId: this.eventData.id,
          answers: this.answerForm.value.answer,
          amount: _money
        }
      };
      const fee = {
        amount: [],
        gas: "1000000",
      };
      try {
        let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
        if (transact.transactionHash && transact.code == 0) {
          this.setToDB(transact.transactionHash, this.eventData);
        } else {
          this.spinnerLoading = false
          this.errorMessage = String(transact)
        }
      } catch (err) {
        this.spinnerLoading = false
        this.errorMessage = String(err.error);
      }
    }
  }


  setToDB(transactionHash, dataAnswer) {
    var _whichAnswer = dataAnswer.answers.findIndex((o) => {
      return o == this.answerForm.value.answer;
    });
    let data = {
      event_id: dataAnswer.id,
      answerIndex: _whichAnswer,
      amount: Number(this.answerForm.value.amount),
      transactionHash: "0x" + transactionHash
    }
    this.postSub = this.postService.post('publicEvents/participate', data).subscribe(async () => {
        await this.updateBalance();
        this.errorMessage = undefined;
        this.spinnerLoading = false
        this.goViewStatus.next(this.eventData.id);
      },
      (err) => {
        this.spinnerLoading = false
        this.errorMessage = String(err.error)
        console.log(err)
      })
  }

  async updateBalance() {
    this.balanceSub = this.GetService.get('users/getBalance').subscribe(async (e: any) => {

      this.store.dispatch(new CoinsActios.UpdateCoins({
        // TODO check bty on main chain
        MainBTY: "0",
        BTY: e.bty,
        BET: e.bet
      }));
    }, error => {
      console.log(error);
    });
  }

  filterKeyCode(event) {
    return event.keyCode !== 69 && event.keyCode !== 189 && event.keyCode !== 187;
  }

  updateValue() {
    let value = this.answerForm.controls.amount.value;
    if (Number(this.coinInfo.BET) < Number(this.answerForm.value.amount)) {
      this.errorMessage = "Don't have enough BET tokens";
    } else {
      this.errorMessage = undefined;
    }
    if (value) {
      value = value.toString();
      if (value.indexOf('.') != '-1') {
        value = value.substring(0, value.indexOf('.') + 3);
        this.answerForm.controls.amount.setValue(value);
      }
    }

  }

  imgForEvent(data) {
    if (data && data.thumColor == 'undefined') {
      return {'background': 'url(' + data?.thumImage + ')center center no-repeat'}
    } else {
      return {'background': data?.thumColor};
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.coinsSub) {
      this.coinsSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
    if (this.balanceSub) {
      this.balanceSub.unsubscribe();
    }
  }

}
