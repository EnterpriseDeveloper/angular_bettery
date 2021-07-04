import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { PostService } from '../../../services/post.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration.component';
import Web3 from 'web3';
import maticInit from '../../../contract/maticInit';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';

@Component({
  selector: 'my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.sass']
})
export class MyProfileComponent implements OnChanges, OnDestroy {
  getAddUserDataSub: Subscription;
  postSub: Subscription;
  updateSub: Subscription;
  updateNameSub: Subscription;
  updateEmailSub: Subscription;

  @Input() userData: User = undefined;
  location = ['Decentralized'];
  language = ['All'];
  addionalData = undefined;

  editFlag: boolean;
  emailFlag: boolean;
  nameForm: string;

  hostRep: number = 0;
  expertRep: number = 0;
  playerRep: number = 0;
  advisorRep: number = 0;

  constructor(
    private store: Store<AppState>,
    private postService: PostService,
    private modalService: NgbModal,
  ) { }

  ngOnChanges(changes) {
    if (changes['userData'].currentValue) {
      let id = changes['userData'].currentValue._id;
      this.nameForm = changes['userData'].currentValue.nickName;
      this.getInfo(id);
    }
  }

  getInfo(id) {
    this.getAddUserDataSub = this.postService.post('user/get_additional_info', { id }).subscribe((x) => {
      this.addionalData = x;
      this.advisorRep = this.addionalData.advisorReputPoins === null ? 0 : this.addionalData.advisorReputPoins;
      this.hostRep = this.addionalData.hostReputPoins === null ? 0 : this.addionalData.hostReputPoins;
      this.expertRep = this.addionalData.expertReputPoins === null ? 0 : this.addionalData.expertReputPoins;
      this.playerRep = this.addionalData.playerReputPoins === null ? 0 : this.addionalData.playerReputPoins;

      if (this.addionalData.publicEmail == null) {
        this.letsUpdatePublicEmail(true);
      } else {
        this.emailFlag = this.addionalData.publicEmail;
      }
    }, (err) => {
      console.log('from get additional data', err);
    });
  }

  getIcon(icon) {
    return {
      'background': `url("../../../../files/profile/${icon}.png") center center no-repeat`,
      'background-size': 'contain',
      'width': '20px',
      'height': '20px',
      'margin-right': '7px'
    };
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
    let MainBETToken = '0';

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

  editClick() {
    this.editFlag = true;
  }

  letsEditName($event) {
    const btn = $event.target.textContent;

    if (btn === 'Save') {
      const data = {
        newNickName: this.nameForm
      };

      this.updateNameSub = this.postService.post('user/update_nickname', data).subscribe(() => {
        this.updateUser();
      }, (err) => {
        console.log('from update_nickname data', err);
      });

      this.editFlag = false;
    }
    if (btn === 'Cancel') {
      this.editFlag = false;
    }
  }

  changeStatusEmail($event) {
    const target = $event.target.textContent;
    if (target === 'Public') {
      this.letsUpdatePublicEmail(true);
    }
    if (target === 'Private') {
      this.letsUpdatePublicEmail(false);
    }
  }

  letsUpdatePublicEmail(status: boolean) {
    const data = {
      publicEmail: status
    };
    this.updateEmailSub = this.postService.post('user/update_public_email', data).subscribe((x: { publicEmail: boolean }) => {
      x.publicEmail = this.emailFlag;
    }, (err) => {
      console.log('from update_public_email data', err);
    });
  }

  updateUser() {
    const data = {
      id: this.userData._id
    };
    this.updateSub = this.postService.post('user/getUserById', data)
      .subscribe(
        (currentUser: User[]) => {
          this.store.dispatch(new UserActions.UpdateUser({
            _id: currentUser[0]._id,
            email: currentUser[0].email,
            nickName: this.nameForm,
            wallet: currentUser[0].wallet,
            listHostEvents: currentUser[0].listHostEvents,
            listParticipantEvents: currentUser[0].listParticipantEvents,
            listValidatorEvents: currentUser[0].listValidatorEvents,
            historyTransaction: currentUser[0].historyTransaction,
            avatar: currentUser[0].avatar,
            verifier: currentUser[0].verifier,
            verifierId: currentUser[0].verifierId,
            sessionToken: currentUser[0].sessionToken,
            accessToken: currentUser[0].accessToken
          }));
        });
  }


  ngOnDestroy() {
    if (this.getAddUserDataSub) {
      this.getAddUserDataSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
    if (this.updateNameSub) {
      this.updateNameSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    if (this.updateEmailSub) {
      this.updateEmailSub.unsubscribe();
    }
  }
}
