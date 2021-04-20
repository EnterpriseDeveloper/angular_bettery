import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard'
import Web3 from "web3"
import Contract from '../../../../../contract/contract';
import _ from "lodash";
import { PostService } from '../../../../../services/post.service';
import web3Obj from '../../../../../helpers/torus'
import maticInit from '../../../../../contract/maticInit.js'
import * as CoinsActios from '../../../../../actions/coins.actions';
import { Subscription } from 'rxjs';
import { PubEventMobile } from '../../../../../models/PubEventMobile.model';
import { User } from '../../../../../models/User.model';
import { Coins } from '../../../../../models/Coins.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'participate',
  templateUrl: './participate.component.html',
  styleUrls: ['./participate.component.sass']
})
export class ParticipateComponent implements OnInit, OnDestroy {
  @Input() eventData: PubEventMobile;
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


  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private _clipboardService: ClipboardService,
    private postService: PostService,
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
    this.coinType = this.eventData.currencyType == "token" ? "BTY" : "ETH"
    this.answerForm = this.formBuilder.group({
      answer: ["", Validators.required],
      amount: ["", [Validators.required, Validators.min(this.coinType == 'BTY' ? 1 : 0.01)]]
    })
  }

  get f() { return this.answerForm.controls; }

  copyToClickBoard() {
    let href = window.location.hostname
    let path = href == "localhost" ? 'http://localhost:4200' : href
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`)
  }

  cancel() {
    this.goBack.next();
  }

  async bet() {
    this.submitted = true;
    if (this.answerForm.invalid) {
      return;
    }

    if (Number(this.coinInfo.BET) < Number(this.answerForm.value.amount)) {
      this.errorMessage = "Don't have enough BET tokens"
    } else {
      this.spinnerLoading = true;
      let web3 = new Web3();
      let contract = new Contract();
      var _money = web3.utils.toWei(String(this.answerForm.value.amount), 'ether')
      await contract.approveBETToken(this.userData.wallet, _money, this.userData.verifier)
      this.setToDB(this.eventData)
    }
  }

  setToDB(dataAnswer) {
    var _whichAnswer = _.findIndex(dataAnswer.answers, (o) => { return o == this.answerForm.value.answer; });
    let data = {
      event_id: dataAnswer.id,
      answerIndex: _whichAnswer,
      userId: this.userData._id,
      amount: Number(this.answerForm.value.amount)
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
    let web3 = new Web3(this.userData.verifier === 'metamask' ? window.web3.currentProvider : web3Obj.torus.provider);

    let matic = new maticInit(this.userData.verifier);
    let BTYToken = await matic.getBTYTokenBalance();
    let BETToken = await matic.getBETTokenBalance();
    let MainBETToken = "0";
    if (!environment.production) {
      // TODO
      MainBETToken = await matic.getBTYTokenOnMainChainBalance();
    }

    let BTYBalance = web3.utils.fromWei(BTYToken, 'ether');
    let BETBalance = web3.utils.fromWei(BETToken, 'ether');
    let MainBTYBalance = web3.utils.fromWei(MainBETToken, 'ether');

    this.store.dispatch(new CoinsActios.UpdateCoins({
      MainBTY: MainBTYBalance,
      BTY: BTYBalance,
      BET: BETBalance
    }));
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
  }


}
