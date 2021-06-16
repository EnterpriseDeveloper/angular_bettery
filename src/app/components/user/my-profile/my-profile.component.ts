import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { PostService } from "../../../services/post.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration.component';
import Web3 from "web3";
import maticInit from '../../../contract/maticInit.js';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import * as CoinsActios from '../../../actions/coins.actions';

@Component({
  selector: 'my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.sass']
})
export class MyProfileComponent implements OnChanges, OnDestroy {
  getAddUserDataSub: Subscription;
  postSub: Subscription;
  @Input() userData: User = undefined;
  location = ["Decentralized"];
  language = ["All"];
  addionalData = undefined;

  constructor(
    private store: Store<AppState>,
    private postService: PostService,
    private modalService: NgbModal,
  ) { }


  ngOnChanges(changes) {
    if (changes['userData'].currentValue) {
      let id = changes['userData'].currentValue._id;
      this.getInfo(id);
    }
  }

  getInfo(id) {
    this.getAddUserDataSub = this.postService.post('user/get_additional_info', { id: id }).subscribe((x) => {
      this.addionalData = x;
    }, (err) => {
      console.log("from get additional data", err)
    })
  }

  getIcon(icon) {
    return {
      "background": `url("../../../../assets/profile/${icon}.png") center center no-repeat`,
      "background-size": "contain",
      "width": "20px",
      "height": "20px",
      "margin-right": "7px"
    }
  }

  linkAccount() {
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
    modalRef.componentInstance.linkUser = true;
    modalRef.componentInstance.linkedAccouns = this.addionalData.linkedAccounts;
    modalRef.componentInstance.linkedDone.subscribe((e) => {
      this.getInfo(this.userData._id);
      this.updateBalance();
    })
  }

  async updateBalance() {
    let web3 = new Web3();

    let matic = new maticInit(this.userData.verifier);
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
    this.sendBalanceToDB(BTYBalance, BETBalance);
  }

  sendBalanceToDB(bty, bet): void {
    const data = {
      bty: bty,
      bet: bet,
      id: this.userData._id
    };

    this.postSub = this.postService.post('users/updateBalance', data).subscribe(async (e) => {
    }, error => {
      console.log(error);
    });
  }

  ngOnDestroy() {
    if (this.getAddUserDataSub) {
      this.getAddUserDataSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }

}
