import { Component, OnDestroy, OnInit } from '@angular/core';
import * as UserActions from './actions/user.actions';
import { PostService } from './services/post.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { User } from './models/User.model';

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
export class AppComponent implements OnDestroy, OnInit {
  autoLoginSub: Subscription;

  constructor(
    private post: PostService,
    private store: Store<AppState>,
  ) {
  }

  ngOnInit() {
    if (window.location.hash.length == 0) {
      this.newDetectUser();
    }
  }


  newDetectUser() {
    const walletDectypt = authHelp.walletDectypt();
    console.log(walletDectypt);
    if (walletDectypt) {
      let userData = walletDectypt.users.find((x) => { return x.sub == walletDectypt.login })
      console.log(userData)
      if (userData) {
        const data = { wallet: userData.pubKey.address, accessToken: userData.accessToken };
        this.autoLoginSub = this.post.post('user/auto_login', data).subscribe(async (x: User) => {
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
          authHelp.setMemo(userData)
        }, (err) => {
          console.log('from auto login', err);
        });
      }
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
