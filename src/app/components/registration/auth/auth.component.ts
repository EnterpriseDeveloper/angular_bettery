import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Store } from '@ngrx/store';

import { AppState } from '../../../app.state';
import authHelp from '../../../helpers/auth-help';
import * as UserActions from '../../../actions/user.actions';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.sass']
})
export class AuthComponent implements OnInit, OnDestroy {
  spinner = true;
  webAuth: any;
  loginSub$: Subscription;
  registerSub$: Subscription;

  constructor(
    private router: Router,
    private postService: PostService,
    private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.webAuth = authHelp.init;
    this.auth0Registration();
  }

  auth0Registration() {
    let wallet;
    let pubKey;
    this.webAuth.parseHash({ hash: window.location.hash }, (err, authResult) => {
      if (err) {
        return console.log(err);
      }

      const pubKeyFromLS = authHelp.walletDectypt();
      if (pubKeyFromLS) {
        pubKey = pubKeyFromLS.pubKey.address;
      }
      if (authResult) {
        this.loginSub$ = this.postService.post('user/auth0_login', { data: authResult, pubKey }).subscribe((data: any) => {
          if (!data) {
            // todo == NEW USER ==
            authHelp.walletInit().then(() => {
              wallet = authHelp.walletUser.pubKey;


              const refId = sessionStorage.getItem('bettery_ref');


              const newUser = {
                nickName: authResult.idTokenPayload.nickname,
                email: authResult.idTokenPayload.email,
                wallet,
                avatar: authResult.idTokenPayload.picture,
                refId: refId ? refId : null,
                verifierId: authResult.idTokenPayload.sub,
                accessToken: authResult.accessToken
              };

              this.registerSub$ = this.postService.post('user/auth0_register', newUser).subscribe((x: any) => {
                if (x) {
                  this.sendUserToStore(x);
                  authHelp.saveAccessTokenLS(x.accessToken);  // save accessToken to LocalStorage from autoLogin
                }
              });
            });

          }

          if (data) {
            if (data.walletVerif === 'failure') {
              console.log('enter seed phrase');
            }
            if (data.walletVerif === 'success') {
              this.sendUserToStore(data);
              authHelp.saveAccessTokenLS(data.accessToken); // save accessToken to LocalStorage from autoLogin
            }
          }
        });
      }
    });
  }

  sendUserToStore(data): void {
    this.store.dispatch(new UserActions.AddUser({
      _id: data._id,
      email: data.email,
      nickName: data.nickName,
      wallet: data.wallet,
      avatar: data.avatar,
      verifier: data.verifier ? data.verifier : 'jwt', // !check
      sessionToken: data.sessionToken, // !check
      verifierId: data.verifierId, // !check
      accessToken: data.accessToken // !check
    }));

    const path = sessionStorage.getItem('betteryPath');
    this.router.navigate([path]);
  }

  ngOnDestroy(): void {
    if (this.registerSub$) {
      this.registerSub$.unsubscribe();
    }
    if (this.loginSub$) {
      this.loginSub$.unsubscribe();
    }
  }
}
