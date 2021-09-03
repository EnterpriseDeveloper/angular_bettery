import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { PostService } from '../../../services/post.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration/registration.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';
import {GetService} from '../../../services/get.service';

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
    private getService: GetService
  ) {

  }

  ngOnChanges(changes) {
    if (changes['userData'].currentValue) {
      let id = changes['userData'].currentValue._id;
      this.nameForm = changes['userData'].currentValue.nickName;
      this.getInfo(id);
    }
  }


  getInfo(id) {
    this.getAddUserDataSub = this.postService.post('user/get_additional_info', { id }).subscribe((x) => {
      console.log(x,'reputation ');
      this.addionalData = x;
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
    this.postSub = this.getService.get('users/getBalance').subscribe(async (e: any) => {

    this.store.dispatch(new CoinsActios.UpdateCoins({
      // TODO check bty on main chain
      MainBTY: "0",
      BTY: e.bty,
      BET: e.bet
    }));
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
