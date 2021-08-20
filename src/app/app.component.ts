import { Component, OnDestroy } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as UserActions from './actions/user.actions';
import { environment } from '../environments/environment';
import { PostService } from './services/post.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { User } from './models/User.model';
import web3Obj from './helpers/torus';

import authHelp from '../app/helpers/auth-help';

declare global {
  interface Window {
    web3: any;
    biconomy: any;
  }
}

window.web3 = window.web3 || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnDestroy {
  autoLoginSub: Subscription;

  constructor(
    private post: PostService,
    private store: Store<AppState>,
  ) {
    // this.detectUser();
    this.newDetectUser();
  }

  // detectUser() {
  //   let autoLogin = localStorage.getItem('_buserlog');
  //   if (autoLogin != null) {
  //     let userData: any = JSON.parse(CryptoJS.AES.decrypt(autoLogin, environment.secretKey).toString(CryptoJS.enc.Utf8));
  //     let data = { wallet: userData.publicAddress, accessToken: userData.accessToken };
  //     this.autoLoginSub = this.post.post('user/auto_login', data).subscribe(async (x: User) => {
  //       await web3Obj.autoLogin(userData.privateKey, userData.publicAddress);
  //       this.addUser(
  //         x.email,
  //         x.nickName,
  //         x.wallet,
  //         x.avatar,
  //         x._id,
  //         x.verifier,
  //         x.sessionToken,
  //         x.verifierId,
  //         x.accessToken
  //       );
  //     }, (err) => {
  //       console.log('from auto login', err);
  //     });
  //   }
  // }

  newDetectUser() {
    const walletDectypt = authHelp.walletDectypt();
    if (walletDectypt && walletDectypt.pubKey.address) {
      const data = { wallet: walletDectypt.pubKey.address, accessToken: walletDectypt.accessToken };
      this.autoLoginSub = this.post.post('user/auto_login', data).subscribe(async (x: User) => {
        // todo login
        this.addUser(
          x.email,
          x.nickName,
          x.wallet,
          x.avatar,
          x._id,
          x.verifier,
          x.sessionToken,
          x.verifierId,
          x.accessToken
        );
      }, (err) => {
        console.log('from auto login', err);
      });

    }
  }

  addUser(
    email: string,
    nickName: string,
    wallet: string,
    avatar: string,
    _id: number,
    verifier: string,
    sessionToken: string,
    verifierId: string,
    accessToken: string
  ) {

    this.store.dispatch(new UserActions.AddUser({
      _id: _id,
      email: email,
      nickName: nickName,
      wallet: wallet,
      avatar: avatar,
      verifier: verifier,
      sessionToken: sessionToken,
      verifierId: verifierId,
      accessToken: accessToken
    }));

  }

  detectPath() {
    const href = window.location.pathname;
    if (href === '/create-event' || href.includes('/private_event') || href.includes('/public_event')) {
      return {
        'background': '#242521'
      };
    } else {
      return;
    }
  }

  ngOnDestroy() {
    if (this.autoLoginSub) {
      this.autoLoginSub.unsubscribe();
    }
  }

}
