import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Coins } from '../../../models/Coins.model';
import Web3 from 'web3';
import { connectToSign } from '../../../contract/cosmosInit';

@Component({
  selector: 'app-swap-bet',
  templateUrl: './swap-bet.component.html',
  styleUrls: ['./swap-bet.component.sass']
})
export class SwapBetComponent {
  @Input() coinInfo: Coins;
  @Input() userId: number;
  @Output() updateBalance = new EventEmitter();
  inputValue: number = 0;
  error = undefined;

  constructor(public activeModal: NgbActiveModal) { }

  async swipe() {
    let web3 = new Web3();
    if (Number(this.coinInfo.BET) > (this.inputValue)) {
      this.error = undefined;
      let amount = web3.utils.toWei(String(this.inputValue), 'ether');
      let { memonic, address, client } = await connectToSign()

      const msg = {
        typeUrl: "/VoroshilovMax.bettery.funds.MsgCreateSwipeBet",
        value: {
          creator: address,
          amount: amount,
          userId: this.userId
        }
      };
      const fee = {
        amount: [],
        gas: "1000000",
      };
      try {
        let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
        if (transact.transactionHash && transact.code == 0) {
          this.activeModal.dismiss('Cross click');
          this.updateBalance.next();
        } else {
          // TODO check validation
          console.log("transaction unsuccessful", transact)
        }
      } catch (err) {
        console.log(err)
        this.error = String(err)
      }
    } else {
      this.error = "Do not enought tokens"
    }
  }

}
