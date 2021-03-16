import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Coins } from '../../../models/Coins.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.sass']
})
export class DepositComponent implements OnInit {
  @Input() status: string;
  @Input() coinInfo: Coins;
  @Input() wallet: string;
  inputValue = '';

  receiveBTY: boolean;
  stillProcessed: boolean;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    // this.status = 'withdraw'
    // this.receiveBTY = true;
    // this.stillProcessed = false;   //for 3 screen

    // this.status = 'withdraw'
    // this.receiveBTY = true;
    // this.stillProcessed = true;   //for 4 screen
  }

  // OLD CODE
  // async deposit() {
  //   if (this.depositAmount > 0) {
  //     if (Number(this.depositAmount) > Number(this.coinInfo.mainNetBalance)) {
  //       this.depositError = "You don't have enough money"
  //     } else {
  //       this.depositSpinner = true;
  //       let web3 = new Web3()
  //       var value = web3.utils.toWei(this.depositAmount.toString(), 'ether')
  //       let matic = new maticInit(this.verifier);
  //       let response = await matic.depositEth(value);
  //       console.log(response);
  //       if (response.message === undefined) {
  //         this.modalService.dismissAll()
  //         this.depositSpinner = false;
  //       } else {
  //         this.depositSpinner = false;
  //         this.depositError = response.message
  //       }
  //     }
  //   } else {
  //     this.depositError = "Must be more than zero"
  //   }
  // }

  // async withdrawal() {
  //   if (this.withdrawalAmount > 0) {
  //     if (Number(this.withdrawalAmount) > Number(this.coinInfo.loomBalance)) {
  //       this.withdrawalError = "You don't have enough money in Loom network"
  //     } else {
  //       this.withdrawalSpinner = true;
  //       let web3 = new Web3()
  //       var value = web3.utils.toWei(this.withdrawalAmount.toString(), 'ether');
  //       let contract = new Contract()
  //       let { withdrawal, sign } = await contract.withdrawalWETHToken(this.userWallet, value, this.verifier)
  //       console.log(withdrawal);
  //       if (withdrawal.transactionHash !== undefined) {
  //         let data = {
  //           userId: this.userId,
  //           transactionHash: withdrawal.transactionHash,
  //           amount: value,
  //           coinType: "ether",
  //           sign: sign
  //         }
  //         this.postSub = this.postService.post("withdrawal/init", data)
  //           .subscribe(async (x: any) => {
  //             this.modalService.dismissAll()
  //             this.withdrawalSpinner = false;
  //           }, (err) => {
  //             console.log(err);
  //             this.withdrawalSpinner = false;
  //             this.withdrawalError = err
  //           })
  //       } else {
  //         this.withdrawalSpinner = false;
  //         this.withdrawalError = withdrawal.message
  //       }
  //     }
  //   } else {
  //     this.withdrawalError = "Must be more than zero"
  //   }
  // }

  // async depositERC20() {
  //   if (this.ERC20depositAmount > 0) {
  //     if (Number(this.ERC20depositAmount) > Number(this.ERC20Coins.mainNetBalance)) {
  //       this.ERC20depositError = "You don't have enough tokens in Ethereum network"
  //     } else {
  //       this.depositSpinner = true;
  //       let web3 = new Web3()
  //       var value = web3.utils.toWei(this.ERC20depositAmount.toString(), 'ether')
  //       let matic = new maticInit(this.verifier);
  //       let response = await matic.depositERC20Token(value)
  //       if (response.message === undefined) {
  //         this.modalService.dismissAll()
  //         this.depositSpinner = false;
  //       } else {
  //         this.depositSpinner = false;
  //         this.ERC20depositError = response.message
  //       }
  //     }
  //   } else {
  //     this.ERC20depositError = "Value must be more that 0"
  //   }
  // }

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

  // @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
  //   this.logOut()
  // }

  maxWithdraw() {
    this.inputValue = this.coinInfo.BTY;
  }
}
