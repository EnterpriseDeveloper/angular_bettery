import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Coins } from '../../../models/Coins.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Web3 from "web3";
import { Subscription } from 'rxjs';
import { PostService } from 'src/app/services/post.service';
import Contract from '../../../contract/contract';
import biconomyMainInit from '../../../contract/biconomyMain';
import biconomyInit from '../../../contract/biconomy';
import {GetService} from '../../../services/get.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './chainTransfer.component.html',
  styleUrls: ['./chainTransfer.component.sass']
})
export class ChainTransferComponent implements OnInit, OnDestroy {
  @Input() status: string;
  @Input() coinInfo: Coins;
  @Input() wallet: string;
  @Input() userId: number;
  @Output() updateBalance = new EventEmitter();

  inputValue: any = 0;
  error: string = undefined;
  spinner: boolean = false;
  avaliableCoins: string = undefined;
  withInitSub: Subscription;
  withExitSub: Subscription;

  receiveBTY: boolean;
  stillProcessed: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    public postService: PostService,
    public getService: GetService
  ) { }

  ngOnInit(): void {
    this.avaliableCoins = this.status == "deposit" ? this.coinInfo.MainBTY : this.coinInfo.BTY;
    if (this.status == 'withdraw') {
      this.checkStatusOfWith();
    }
  }

  checkStatusOfWith() {
    this.withExitSub = this.getService.get('withdrawal/exit').subscribe((x) => {
      // this.status = 'withdraw'
      // this.receiveBTY = true;
      // this.stillProcessed = false;   //for 3 screen

      // this.status = 'withdraw'
      // this.receiveBTY = true;
      // this.stillProcessed = true;   //for 4 screen
    }, (err) => {
      console.log(err)
    })
  }

  maxWithdraw() {
    this.inputValue = this.coinInfo.BTY;
  }

  maxDeposit() {
    this.inputValue = this.coinInfo.MainBTY;
  }

  async deposit() {
    if (this.inputValue > 0) {
      if (Number(this.inputValue) > Number(this.coinInfo.MainBTY)) {
        this.error = "You don't have enough token for deposit"
      } else {
        this.spinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.inputValue.toString(), 'ether');
        let biconomy_provider = await biconomyMainInit();
        let contrc = new Contract();
        let approve: any = await contrc.approveBTYmainToken(this.wallet, value, biconomy_provider)
        console.log(approve);
        if (approve.message === undefined) {
          let deposit: any = await contrc.deposit(this.wallet, value, "torus", biconomy_provider) // switch "torus" to another wallet if we will use another one
          console.log(deposit);
          if (deposit.message === undefined) {
            // this.activeModal.dismiss('Cross click')
            // this.spinner = false;
          } else {
            await biconomyInit();
            this.spinner = false;
            console.log(deposit.message);
            this.error = String(deposit.message);
          }
        } else {
          await biconomyInit();
          this.spinner = false;
          console.log(approve.message);
          this.error = String(approve.message);
        }
      }
    } else {
      this.error = "Amount must be bigger that 0"
    }
  }

  async withdrawal() {
    if (this.inputValue > 0) {
      if (Number(this.inputValue) > Number(this.coinInfo.BTY)) {
        this.error = "You don't have enough tokens for withdrawal"
      } else {
        this.spinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.inputValue.toString(), 'ether');
        // TODO
        // let matic = new maticInit(this.verifier);
        // let withdrawal = await matic.withdraw(value, false)
        // if (withdrawal.transactionHash !== undefined) {
        //   let data = {
        //     userId: this.userId,
        //     transactionHash: withdrawal.transactionHash,
        //     amount: value
        //   }
        //   this.withInitSub = this.postService.post("withdrawal/init", data)
        //     .subscribe(async (x: any) => {
        //       this.activeModal.dismiss('Cross click');
        //       this.spinner = false;
        //     }, (err) => {
        //       console.log(err);
        //       this.spinner = false;
        //       this.error = String(err.error)
        //     })
        // } else {
        //   this.spinner = false;
        //   this.error = String(withdrawal.message);
        // }
      }
    } else {
      this.error = "Amount must be bigger that 0"
    }
  }

  async close() {
    await biconomyInit();
    this.activeModal.dismiss('Cross click');
  }

  ngOnDestroy() {
    if (this.withInitSub) {
      this.withInitSub.unsubscribe()
    }
    if (this.withExitSub) {
      this.withExitSub.unsubscribe()
    }
  }

}
