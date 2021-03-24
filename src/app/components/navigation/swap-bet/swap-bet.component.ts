import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Coins} from '../../../models/Coins.model';

@Component({
  selector: 'app-swap-bet',
  templateUrl: './swap-bet.component.html',
  styleUrls: ['./swap-bet.component.sass']
})
export class SwapBetComponent implements OnInit {
  @Input() coinInfo: Coins;
  inputValue = '';
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
