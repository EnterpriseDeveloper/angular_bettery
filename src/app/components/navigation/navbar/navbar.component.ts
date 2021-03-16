import {Component, OnInit, OnDestroy, HostListener, ViewChild, DoCheck, ElementRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.state';
import {Coins} from '../../../models/Coins.model';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';
import maticInit from '../../../contract/maticInit.js';
import {ClipboardService} from 'ngx-clipboard';

import Web3 from 'web3';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import web3Obj from '../../../helpers/torus';
import {Subscription} from 'rxjs';
import {User} from '../../../models/User.model';
import {RegistrationComponent} from '../../registration/registration.component';
import biconomyInit from '../../../../app/contract/biconomy';
import {DepositComponent} from '../deposit/deposit.component';


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild('insideElement', {static: false}) insideElement;

  nickName: string = undefined;
  web3: Web3 | undefined = null;
  coinInfo: Coins = null;
  amountSpinner: boolean = true;
  userWallet: string = undefined;
  userId: number;
  userSub: Subscription;
  coinsSub: Subscription;
  userHistory: any = [];
  loadMore = false;
  avatar: string;
  verifier: string = undefined;
  openNavBar = false;
  display: boolean = false;
  saveUserLocStorage = [];
  logoutBox: boolean;
  copyLinkFlag: boolean;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private eRef: ElementRef,
    private _clipboardService: ClipboardService,
  ) {

    this.detectPath();

    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length !== 0) {
        this.nickName = x[0].nickName;
        this.userWallet = x[0].wallet;
        this.verifier = x[0].verifier;
        this.avatar = x[0].avatar;
        this.userId = x[0]._id;

        let historyData = _.orderBy(x[0].historyTransaction, ['date'], ['desc']);
        this.getHistoryUsers(historyData);
        this.updateBalance();
      }
    });

    this.coinsSub = this.store.select('coins').subscribe((x) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    });
  }

  ngDoCheck() {
    this.detectPath();
  }

  detectPath() {
    let href = window.location.pathname;
    if (href == '/' || href == '/tokensale' || href == "/.well-known/pki-validation/fileauth.txt") {
      this.display = false;
    } else {
      this.display = true;
    }
  }

  getHistoryUsers(data) {
    if (data === undefined) {
      this.userHistory = [];
      this.loadMore = false;
    } else {
      let z = data.map((x) => {
        return {
          date: Number((new Date(x.date).getTime() * 1000).toFixed(0)),
          amount: x.amount.toFixed(4),
          currencyType: x.currencyType,
          paymentWay: x.paymentWay,
          eventId: x.eventId,
          role: x.role
        };
      });
      if (z.length > 5) {
        this.loadMore = true;
        this.userHistory = z.slice(0, 5);
      } else {
        this.loadMore = true;
        this.userHistory = z;
      }
    }
  }

  async ngOnInit() {
    this.onDocumentClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.onDocumentClick);
    await biconomyInit();
  }

  depositGuard() {
    if (!this.amountSpinner) {
      return true;
    } else {
      return false;
    }
  }

  async updateBalance() {
    let web3 = new Web3(this.verifier === 'metamask' ? window.web3.currentProvider : web3Obj.torus.provider);

    let matic = new maticInit(this.verifier);
    let BTYToken = await matic.getBTYTokenBalance();
    let BETToken = await matic.getBETTokenBalance();
    let MainBETToken = await matic.getBTYTokenOnMainChainBalance();

    let BTYBalance = web3.utils.fromWei(BTYToken, 'ether');
    let BETBalance = web3.utils.fromWei(BETToken, 'ether');
    let MainBTYBalance = web3.utils.fromWei(MainBETToken, 'ether');

    this.store.dispatch(new CoinsActios.UpdateCoins({
      MainBTY: MainBTYBalance,
      BTY: BTYBalance,
      BET: BETBalance
    }));
    this.amountSpinner = false;
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    this.updateBalance();
  }

  @HostListener('document:click', ['$event'])
  public clickout() {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.logoutBox = false;
    }
  }

  async logOut() {
    if (this.userWallet !== undefined && this.verifier !== 'metamask') {
      await web3Obj.torus.cleanUp();
    }
    this.store.dispatch(new UserActions.RemoveUser(0));
    this.nickName = undefined;
    this.openNavBar = false;
    this.logoutBox = false;
  }

  async loginWithTorus() {
    const modalRef = this.modalService.open(RegistrationComponent, {centered: true});
    modalRef.componentInstance.openSpinner = true;
  }


  navBar() {
    this.openNavBar = !this.openNavBar;
  }


  protected onDocumentClick(event: MouseEvent) {
    if (this.insideElement) {
      if (this.insideElement.nativeElement.contains(event.target)) {
        return;
      }
      this.openNavBar = false;
    }
  }

  openWallet() {
    web3Obj.torus.showWallet('home');
  }

  copyRefLink() {
    this.copyLinkFlag = true;
    let href = window.location.hostname;
    let path = href == 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/ref/${this.userId}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick);
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.coinsSub) {
      this.coinsSub.unsubscribe();
    }
  }

  openModal(contentModal) {
    this.modalService.open(contentModal, {size: 'sm', centered: true});
    this.openNavBar = false;
  }

  toggleLogout() {
    this.logoutBox = !this.logoutBox;
  }

  openDeposit(str: string) {
    const modalRef = this.modalService.open(DepositComponent, {centered: true});
    modalRef.componentInstance.status = str;
    modalRef.componentInstance.coinInfo = this.coinInfo;
    modalRef.componentInstance.wallet = this.userWallet;
    modalRef.componentInstance.userId = this.userId; 
  }
}
