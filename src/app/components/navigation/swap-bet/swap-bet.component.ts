import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Coins} from '../../../models/Coins.model';
import Contract from '../../../contract/contract';
import Web3 from 'web3';

@Component({
  selector: 'app-swap-bet',
  templateUrl: './swap-bet.component.html',
  styleUrls: ['./swap-bet.component.sass']
})
export class SwapBetComponent {
  @Input() coinInfo: Coins;
  @Input() userWallet: number;
  @Output() updateBalance = new EventEmitter();
  inputValue: number = 0;
  error = undefined;
  spinner = false; // TODO Andery add spinner if needed

  constructor(public activeModal: NgbActiveModal) { }

  async swipe(){
    let contr = new Contract();
    let web3 = new Web3();
    if(Number(this.coinInfo.BET) > (this.inputValue)){
      this.error = undefined;
      this.spinner = true;
      let amount = web3.utils.toWei(String(this.inputValue), 'ether');
      let tx: any = await contr.swipeTokens(this.userWallet, amount, "torus") // switch "torus" if you will use another wallet
      if(tx.transactionHash != undefined){
        this.spinner = false;
        this.activeModal.dismiss('Cross click');
        this.updateBalance.next();
      }else{
        console.error(tx);
      }
    }else{
      this.error = "Do not enought tokens"
    }
  }

}
