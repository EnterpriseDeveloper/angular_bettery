import { Component, OnInit, OnDestroy, HostListener, ViewChild, DoCheck, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { Coins } from '../../../models/Coins.model';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';
import maticInit from '../../../contract/maticInit.js';
import { ClipboardService } from 'ngx-clipboard';

import Web3 from 'web3';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import web3Obj from '../../../helpers/torus';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { RegistrationComponent } from '../../registration/registration.component';
import { ChainTransferComponent } from '../chainTransfer/chainTransfer.component';
import { SwapBetComponent } from '../swap-bet/swap-bet.component';
import { PostService } from '../../../services/post.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild('insideElement', { static: false }) insideElement;

  nickName: string = undefined;
  web3: Web3 | undefined = null;
  coinInfo: Coins = null;
  amountSpinner: boolean = true;
  userWallet: string = undefined;
  userId: number;
  userSub: Subscription;
  coinsSub: Subscription;
  depositSub: Subscription;
  swipeSub: Subscription;
  userHistory: any = [];
  loadMore = false;
  avatar: string;
  verifier: string = undefined;
  openNavBar = false;
  display: boolean = false;
  saveUserLocStorage = [];
  logoutBox: boolean;
  copyLinkFlag: boolean;
  postSub: Subscription;
  environments = environment;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private eRef: ElementRef,
    private _clipboardService: ClipboardService,
    private postService: PostService
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
    if (href == '/' || href == '/tokensale' || href == '/.well-known/pki-validation/fileauth.txt') {
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
  }

  depositGuard() {
    if (!this.amountSpinner) {
      return true;
    } else {
      return false;
    }
  }

  async updateBalance() {
    let web3 = new Web3();

    let matic = new maticInit(this.verifier);
    let BTYToken = await matic.getBTYTokenBalance();
    let BETToken = await matic.getBETTokenBalance();
    let MainBETToken = "0";

    if (!environment.production) {
      // TODO
      MainBETToken = await matic.getBTYTokenOnMainChainBalance();
    }

    let BTYBalance = web3.utils.fromWei(BTYToken, 'ether');
    let BETBalance = web3.utils.fromWei(BETToken, 'ether');
    let MainBTYBalance = web3.utils.fromWei(MainBETToken, 'ether');

    this.store.dispatch(new CoinsActios.UpdateCoins({
      MainBTY: MainBTYBalance,
      BTY: BTYBalance,
      BET: BETBalance
    }));
    this.amountSpinner = false;
    this.sendBalanceToDB(BTYBalance, BETBalance);
  }

  sendBalanceToDB(bty, bet): void {
    const data = {
      bty: bty,
      bet: bet,
    };

    this.postSub = this.postService.post('users/updateBalance', data).subscribe(async (e) => {
    }, error => {
      console.log(error);
    });
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
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
      await web3Obj.logOut();
    }
    this.store.dispatch(new UserActions.RemoveUser(0));
    this.nickName = undefined;
    this.openNavBar = false;
    this.logoutBox = false;
  }

  async loginWithTorus() {
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
  }


  navBar() {
    this.openNavBar = !this.openNavBar;
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick($event: MouseEvent) {
      if (this.insideElement) {
        if (this.insideElement.nativeElement.contains($event.target)) {
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

  openModal(contentModal) {
    this.modalService.open(contentModal, { size: 'sm', centered: true });
    this.openNavBar = false;
  }

  toggleLogout(param) {
    if (param) {
      this.logoutBox = !this.logoutBox;
      return;
    }
    this.logoutBox = false;
  }

  openDeposit(str: string) {
    this.updateBalance();
    const modalRef = this.modalService.open(ChainTransferComponent, { centered: true });
    modalRef.componentInstance.status = str;
    modalRef.componentInstance.coinInfo = this.coinInfo;
    modalRef.componentInstance.wallet = this.userWallet;
    modalRef.componentInstance.userId = this.userId;
    this.depositSub = modalRef.componentInstance.updateBalance.subscribe(() => {
      this.updateBalance();
    });
  }

  openSwapBetToBTY() {
    this.updateBalance();
    const modalRef = this.modalService.open(SwapBetComponent, { centered: true });
    modalRef.componentInstance.coinInfo = this.coinInfo;
    modalRef.componentInstance.userWallet = this.userWallet;
    this.swipeSub = modalRef.componentInstance.updateBalance.subscribe(() => {
      this.updateBalance();
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.coinsSub) {
      this.coinsSub.unsubscribe();
    }
    if (this.depositSub) {
      this.depositSub.unsubscribe();
    }
    if (this.swipeSub) {
      this.swipeSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }
}
