import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../../share/info-modal/info-modal.component';

import {Store} from '@ngrx/store';
import {AppState} from '../../../../../app.state';
import {Subscription} from 'rxjs';
import _ from 'lodash';
import {ClipboardService} from 'ngx-clipboard';
import {PubEventMobile} from '../../../../../models/PubEventMobile.model';

@Component({
  selector: 'event-finish',
  templateUrl: './event-finish.component.html',
  styleUrls: ['./event-finish.component.sass']
})
export class EventFinishComponent implements OnInit, OnDestroy {
  @Input() eventData: PubEventMobile;
  status = undefined;
  hostStatus = undefined;
  amount = undefined;
  info = undefined;
  userSub: Subscription;
  userData = undefined;
  pool = 0;
  currencyType: string;
  viewMore: number = null;
  coinType: string = undefined;
  host: boolean = false;
  role: string = undefined;
  winner: boolean = false;
  playerIndex: number;

  constructor(
    private modalService: NgbModal,
    private store: Store<AppState>,
    private _clipboardService: ClipboardService
  ) {}

  ngOnInit() {
    this.currencyType = this.eventData.currencyType == 'token' ? 'BTY' : 'ETH';
    this.userSub = this.store.select('user').subscribe((x) => {
      if (x.length != 0) {
        this.userData = x[0];
        if (this.eventData.host.id === x[0]._id) {
          this.host = true;
        }
        this.letsFindWinner(x[0]);
      } else {
        this.status = undefined;
        this.amount = undefined;
        this.info = undefined;
        this.userData = undefined;
        this.host = false;
        this.role = undefined;
        this.winner = false;
        this.playerIndex = undefined;
      }
    });
  }

  viewMoreToggle(i) {
    this.viewMore == i ? this.viewMore = null : this.viewMore = i;
  }

  letsFindWinner(user) {
    let findValidator = _.findIndex(this.eventData.validatorsAnswers, (x) => {
      return x.userId == user._id;
    });
    if (findValidator !== -1) {
      this.playerIndex = findValidator;
      this.role = 'Expert';
      this.winner = this.eventData.validatorsAnswers[findValidator].answer == this.eventData.finalAnswer;
      this.status = this.eventData.validatorsAnswers[findValidator].answer == this.eventData.finalAnswer ? 'YOU EARNED' : '';
      this.amount = this.eventData.validatorsAnswers[findValidator].answer == this.eventData.finalAnswer ? this.letsCalcalteWinner('expert') : 'YOU WERE WRONG';
      this.info = this.eventData.validatorsAnswers[findValidator].answer == this.eventData.finalAnswer ? `Soon, users will get extra BTY minted from events.` : 'You’ll lose Rep once Reputation system is added.';
    } else {
      if (this.eventData.parcipiantAnswers != undefined) {
        let findPlayer = _.findIndex(this.eventData.parcipiantAnswers, (x) => {
          return x.userId == user._id;
        });
        if (findPlayer !== -1) {
          this.playerIndex = findPlayer;
          this.role = 'Player';
          this.winner = this.eventData.parcipiantAnswers[findPlayer].answer == this.eventData.finalAnswer;
          this.status = this.eventData.parcipiantAnswers[findPlayer].answer == this.eventData.finalAnswer ? 'YOU WON' : 'YOU LOST';
          this.amount = this.letsCalcalteWinner('player');
          this.info = this.eventData.parcipiantAnswers[findPlayer].answer == this.eventData.finalAnswer ? 'Soon, users will get extra BTY minted from events.' : `You didn’t win, but have 1 BTY to win next time!`;
        } else {
          this.findHost(user);
        }
      } else {
        this.findHost(user);
      }
    }
  }

  findHost(user) {
    if (this.eventData.host.id === user._id) {
      this.status = 'You earned';
      this.amount = this.letsCalcalteWinner('host');
      this.info = `Soon, users will get extra BTY minted from events.`;
    }
  }

  getHostWin() {
    if (this.userData && this.eventData.host.id == this.userData._id) {
      return this.eventData.host.payHostAmount + this.eventData.host.mintedHostAmount;
    }
  }

  letsCalcalteWinner(from) {
    if (from == 'player') {
      if (this.userData != undefined && this.eventData) {
        const findParc = this.eventData.parcipiantAnswers.filter((x) => {
          return x.userId == this.userData._id;
        });
        if (findParc.length != 0 && findParc[0].answer == this.eventData.finalAnswer) {
          return this.checkFractionalNumb(findParc[0].payToken, findParc[0].mintedToken, '+');
        } else {
          return this.checkFractionalNumb(findParc[0].amount, findParc[0].mintedToken, '-');
        }
      }
    }

    if (from == 'expert') {
      const findValid = this.eventData.validatorsAnswers.filter((x) => {
        return x.userId == this.userData._id;
      });
      if (findValid.length != 0) {
        return this.checkFractionalNumb(findValid[0].mintedToken, findValid[0].payToken, '+');
      }
    }
  }

  getMinted() {
    const sumMintedParc = this.eventData.parcipiantAnswers.reduce((sum, elem) => {
      return sum + Number(elem.mintedToken);
    }, 0);
    const sumMintedValidator = this.eventData.validatorsAnswers.reduce((sum, elem) => {
      return sum + Number(elem.mintedToken);
    }, 0);
    return this.checkFractionalNumb(sumMintedParc, sumMintedValidator, '+');
  }

  checkFractionalNumb(num1, num2, action) {
    if (action === '+') {
      const sum = Number(num1) + Number(num2);
      return sum.toString().includes('.') ? sum.toFixed(2) : sum;
    }
    if (action === '-') {
      const difference = Number(num1) - Number(num2);
      return difference.toString().includes('.') ? difference.toFixed(2) : difference;
    }
  }

  getPool() {
    let pool = 0;
    if (this.eventData.parcipiantAnswers !== undefined) {
      this.eventData.parcipiantAnswers.forEach(x => {
        pool = pool + Number(x.amount);
      });
      return pool;
    } else {
      return 0;
    }
  }

  getPartPos(i) {
    let index = [4, 3, 2, 1];
    return {
      'z-index': index[i],
      'position': 'relative',
      'right': (i * 10) + 'px'
    };
  }

  getAmountColor(text) {
    let z = text.indexOf('LOST');
    let x = text.indexOf('WRONG');
    if (text == '') {
      return {
        'color': '#C10000',
        'font-size': '24px',
        'padding-top': '25px',
        'padding-bottom': '29px'
      };
    } else if (z !== -1 || x !== -1) {
      return {
        'color': '#C10000'
      };
    } else {
      return {
        'color': '#FFD200'
      };
    }
  }

  playersBet(i) {
    if (this.eventData.parcipiantAnswers == undefined) {
      return 0;
    } else {
      let data = _.filter(this.eventData.parcipiantAnswers, (x) => {
        return x.answer == i;
      });
      return data.length;
    }
  }

  expertsBet(i) {
    if (this.eventData.validatorsAnswers == undefined) {
      return 0;
    } else {
      let data = _.filter(this.eventData.validatorsAnswers, (x) => {
        return x.answer == i;
      });
      return data.length + '/' + this.eventData.validatorsAnswers.length;
    }
  }

  playersPers(i) {
    return ((this.playersBet(i) * 100) / this.playersCount()) + '%';
  }

  totalBetAmount(i) {
    let data = _.filter(this.eventData.parcipiantAnswers, (x) => {
      return x.answer == i;
    });
    if (data.length != 0) {
      let amount = 0;
      data.forEach(x => {
        amount += x.amount;
      });
      return amount;
    }
  }


  playersCount() {
    return this.eventData.parcipiantAnswers == undefined ? 0 : this.eventData.parcipiantAnswers.length;
  }

  expertCount() {
    return this.eventData.validatorsAnswers == undefined ? 0 : this.eventData.validatorsAnswers.length;
  }

  openInfoModal(title, name, link) {
    const modalRef = this.modalService.open(InfoModalComponent, {centered: true});
    modalRef.componentInstance.boldName = title;
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.link = link;
  }

  biggestWin() {
    if (this.eventData.parcipiantAnswers != undefined) {
      let biggest = 0;
      for (let i = 0; i < this.eventData.parcipiantAnswers.length; i++) {
        const el = this.eventData.parcipiantAnswers[i].payToken + this.eventData.parcipiantAnswers[i].mintedToken;
        if (el > biggest) {
          biggest = el;
        }
      }
      return biggest.toString().includes('.') ? biggest.toFixed(2) : biggest;
    } else {
      return 0;
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  createEventText() {
    if (!this.userData) {
      return 'CREATE YOUR OWN EVENT';
    } else {
      if (this.host) {
        return 'HOST ANOTHER EVENT';
      } else {
        return 'HOST YOUR OWN EVENT';
      }
    }
  }

  getImgFlag() {
    if (!this.userData) {
      return 'flagImg hostFlag';
    } else {
      if (this.host) {
        return 'flagImg hostFlag';
      } else if (this.role == 'Expert') {
        return 'flagImg expertFlag';
      } else if (this.role == 'Player') {
        return 'flagImg playerFlag';
      }
    }
  }

  titleColor() {
    if (!this.userData) {
      return 'color: #FFD300';
    } else {
      if (this.host) {
        return 'color: #FFD300';
      } else if (this.role == 'Expert') {
        return 'color: #BF94E4';
      } else if (this.role == 'Player') {
        return 'color: #34DDDD';
      }
    }
  }

  roleColor() {
    if (this.role == 'Expert') {
      return 'color: #BF94E4';
    } else if (this.role == 'Player') {
      return 'color: #34DDDD';
    }
  }

  copyToClickBoard() {
    let href = window.location.hostname;
    let path = href == 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/public_event/${this.eventData.id}`);
  }
}
