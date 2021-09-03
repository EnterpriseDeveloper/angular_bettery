import { Component, OnInit, OnDestroy, HostListener, ViewChild, DoCheck, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { Coins } from '../../../models/Coins.model';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';
import { ClipboardService } from 'ngx-clipboard';

import Web3 from 'web3';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { RegistrationComponent } from '../../registration/registration/registration.component';
import { ChainTransferComponent } from '../chainTransfer/chainTransfer.component';
import { SwapBetComponent } from '../swap-bet/swap-bet.component';
import { environment } from '../../../../environments/environment';
import {GetService} from '../../../services/get.service';
import authHelp from '../../../helpers/auth-help';


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
  avatar: string;
  verifier: string = undefined;
  openNavBar = false;
  display: boolean = false;
  saveUserLocStorage = [];
  logoutBox: boolean;
  copyLinkFlag: boolean;
  postSub: Subscription;
  logoutSub: Subscription;
  environments = environment;
  webAuth;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private eRef: ElementRef,
    private _clipboardService: ClipboardService,
    private getService: GetService
  ) {

    this.detectPath();

    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length !== 0) {
        this.nickName = x[0].nickName;
        this.userWallet = x[0].wallet;
        this.verifier = x[0].verifier;
        this.avatar = x[0].avatar;
        this.userId = x[0]._id;
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

  async ngOnInit() {
    this.webAuth = authHelp.init;
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
    this.postSub = this.getService.get('users/getBalance').subscribe(async (e: any) => {

    this.store.dispatch(new CoinsActios.UpdateCoins({
      // TODO check bty on main chain 
      MainBTY: "0",
      BTY: e.bty,
      BET: e.bet
    }));
    this.amountSpinner = false;
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

  async newlogOut() {
    this.logoutSub = this.getService.get('user/logout').subscribe(() => {
      this.webAuth.logout({
        returnTo: `${environment.auth0_URI}/join`,
        client_id: '49atoPMGb9TWoaDflncmvPQOCccRWPyf',
      });
      localStorage.removeItem('_buserlog');
      this.store.dispatch(new UserActions.RemoveUser(0));
      this.nickName = undefined;
      this.openNavBar = false;
      this.logoutBox = false;
    }, err => {
      console.log(err);
    });
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
