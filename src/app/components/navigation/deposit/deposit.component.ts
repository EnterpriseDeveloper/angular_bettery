import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {Coins} from '../../../models/Coins.model';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

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

    //
    // this.status = 'withdraw'
    // this.receiveBTY = true;
    // this.stillProcessed = true;   //for 4 screen

  }
  maxWithdraw() {
    this.inputValue = this.coinInfo.tokenBalance;
  }
}
