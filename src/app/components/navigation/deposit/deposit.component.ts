import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Coins } from '../../../models/Coins.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Web3 from "web3";

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.sass']
})
export class DepositComponent implements OnInit {
  @Input() status: string;
  @Input() coinInfo: Coins;
  @Input() wallet: string;
  inputValue: any = 0;
  error: string = undefined;
  spinner: boolean = false;
  avaliableCoins: string = undefined;

  receiveBTY: boolean;
  stillProcessed: boolean;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    this.avaliableCoins = this.status == "deposit" ? this.coinInfo.MainBTY : this.coinInfo.BTY;
    // this.status = 'withdraw'
    // this.receiveBTY = true;
    // this.stillProcessed = false;   //for 3 screen

    // this.status = 'withdraw'
    // this.receiveBTY = true;
    // this.stillProcessed = true;   //for 4 screen
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

  // async withdrawalERC20() {
  //   if (this.ERC20withdrawalAmount > 0) {
  //     if (Number(this.ERC20withdrawalAmount) > Number(this.ERC20Coins.loomBalance)) {
  //       this.ERC20withdrawalError = "You don't have enough tokens in Ethereum network"
  //     } else {
  //       this.withdrawalSpinner = true;
  //       let web3 = new Web3()
  //       var value = web3.utils.toWei(this.ERC20withdrawalAmount.toString(), 'ether');
  //       let matic = new maticInit(this.verifier);
  //       let withdrawal = await matic.withdraw(value, false)
  //       if (withdrawal.transactionHash !== undefined) {
  //         let data = {
  //           userId: this.userId,
  //           transactionHash: withdrawal.transactionHash,
  //           amount: value,
  //           coinType: "token"
  //         }
  //         this.postSub = this.postService.post("withdrawal/init", data)
  //           .subscribe(async (x: any) => {
  //             this.modalService.dismissAll()
  //             this.withdrawalSpinner = false;
  //           }, (err) => {
  //             console.log(err);
  //             this.withdrawalSpinner = false;
  //             this.ERC20withdrawalError = err
  //           })
  //       } else {
  //         this.withdrawalSpinner = false;
  //         this.ERC20withdrawalError = withdrawal.message
  //       }
  //     }
  //   } else {
  //     this.ERC20withdrawalError = "Value must be more that 0"
  //   }
  // }

}
