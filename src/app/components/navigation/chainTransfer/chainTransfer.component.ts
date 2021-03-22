import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Coins } from '../../../models/Coins.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Web3 from "web3";
import { Subscription } from 'rxjs';
import { PostService } from 'src/app/services/post.service';

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
    public postService: PostService
  ) { }

  ngOnInit(): void {
    this.avaliableCoins = this.status == "deposit" ? this.coinInfo.MainBTY : this.coinInfo.BTY;
    if (this.status == 'withdraw') {
      this.checkStatusOfWith();
    }
  }

  checkStatusOfWith() {
    let data = {
      id: this.userId
    }
    this.withExitSub = this.postService.post("withdrawal/exit", data).subscribe((x) => {
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
        var value = web3.utils.toWei(this.inputValue.toString(), 'ether')
        // TODO
        // let matic = new maticInit(this.verifier);
        // let response = await matic.depositEth(value);
        // console.log(response);
        // if (response.message === undefined) {
        //   this.activeModal.dismiss('Cross click')
        //   this.spinner = false;
        // } else {
        //   this.spinner = false;
        //   console.log(response.message);
        //   this.error = String(response.message);
        // }
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

  ngOnDestroy() {
    if (this.withInitSub) {
      this.withInitSub.unsubscribe()
    }
    if (this.withExitSub) {
      this.withExitSub.unsubscribe()
    }
  }

}
