import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Coins } from '../../models/Coins.model';
import * as CoinsActios from '../../actions/coins.actions';

import LoomEthCoin from '../../services/LoomEthCoin';
import Web3 from 'web3';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';




@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent {

  nickName: string = undefined;
  regisModal: boolean = false
  loomEthCoinData = null;
  web3: Web3 | undefined = null;
  coinInfo: Coins = null;
  depositAmount: number = 0;
  withdrawalAmount: number = 0;
  depositError: string = undefined;
  withdrawalError: string = undefined;
  amountSpinner: boolean = true;
  depositSpinner: boolean = false;
  withdrawalSpinner: boolean = false;


  constructor(private store: Store<AppState>, private modalService: NgbModal) {
    this.store.select("user").subscribe((x) => {
      if (x.length !== 0) {
        console.log(x);
        this.nickName = x[0].nickName;
        this.connectToLoom()
      }
    });
  }

  connectToLoom() {
    this.web3 = new Web3(window.web3.currentProvider);
    this.loomEthCoinData = new LoomEthCoin()
    this.loomEthCoinData.load(this.web3)
    setTimeout(() => {
      this.updateBalance()
    }, 2500)
  }

  async updateBalance() {
    this.coinInfo = await this.loomEthCoinData._updateBalances()
    this.store.dispatch(new CoinsActios.AddCoins({ loomBalance: this.coinInfo.loomBalance, mainNetBalance: this.coinInfo.mainNetBalance }))

    this.amountSpinner = false;
    console.log(this.coinInfo);
  }


  registrationModal() {
    this.regisModal = !this.regisModal;
  }

  receiveRegistState($event) {
    this.regisModal = $event;
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.updateBalance()
  }


  changeInput() {
    this.depositError = undefined;
  }

  changeWithdrawal() {
    this.withdrawalError = undefined;
  }

  async deposit() {
    if (this.depositAmount > 0) {
      if (Number(this.depositAmount) > Number(this.coinInfo.mainNetBalance)) {
        this.depositError = "You don't have enough money"
      } else {
        this.depositSpinner = true;
        var value = this.web3.utils.toWei(this.depositAmount.toString(), 'ether')
        let response = await this.loomEthCoinData.depositEth(value);
        if (response === undefined) {
          this.modalService.dismissAll()
          this.depositSpinner = false;
        } else {
          this.depositSpinner = false;
          this.depositError = response.message
        }
      }
    } else {
      this.depositError = "Must be more than zero"
    }
  }

  async withdrawal() {
    if (this.withdrawalAmount > 0) {
      if (Number(this.withdrawalAmount) > Number(this.coinInfo.loomBalance)) {
        this.withdrawalError = "You don't have enough money in Loom network"
      } else {
        var value = this.web3.utils.toWei(this.withdrawalAmount.toString(), 'ether')
        let response = await this.loomEthCoinData.withdrawEth(value)
        if (response === undefined) {
          this.modalService.dismissAll()
          this.withdrawalSpinner = false;
        } else {
          this.withdrawalSpinner = false;
          this.withdrawalError = response.message
        }
        console.log(response);
      }
    } else {
      this.withdrawalError = "Must be more than zero"
    }
  }


}
