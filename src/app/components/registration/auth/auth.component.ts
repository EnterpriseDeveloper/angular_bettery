import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PostService} from '../../../services/post.service';
import {Store} from '@ngrx/store';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {AppState} from '../../../app.state';
import authHelp from '../../../helpers/auth-help';
import * as UserActions from '../../../actions/user.actions';
import {Subscription} from 'rxjs';


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
  authResultGlobal: any;
  seedPhrase: string;
  walletFromDB;
  modalStatus: boolean;
  modalOpen: boolean;
  dataRegist: any;

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
    let mnemonic;
    this.webAuth.parseHash({hash: window.location.hash}, (err, authResult) => {
      if (err) {
        return console.log(err);
      }

      const pubKeyFromLS = authHelp.walletDectypt();
      if (pubKeyFromLS) {
        pubKey = pubKeyFromLS.pubKey.address;
      }
      if (authResult) {

        const dataForSend = {
            email: authResult.idTokenPayload.email,
            nickname: authResult.idTokenPayload.nickname,
            verifierId: authResult.idTokenPayload.sub,
            pubKey: pubKey,
            accessToken: authResult.accessToken
        };
        this.authResultGlobal = dataForSend;
        this.loginSub$ = this.postService.post('user/auth0_login', dataForSend).subscribe((data: any) => {
          if (!data) {
            // todo == NEW USER ==
            authHelp.walletInit().then(() => {
              wallet = authHelp.walletUser.pubKey;
              mnemonic = authHelp.walletUser.mnemonic;

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
                this.dataRegist = x;
                if (x) {
                  // ?show seed phrase
                  this.modalOpen = true;
                  this.modalStatus = false;
                  this.spinner = false;
                  this.seedPhrase = mnemonic;
                  // ?====================
                }
              });
            });

          }

          if (data) {
            if (data.walletVerif === 'failure') {
              console.log('need enter seed phrase');
              this.walletFromDB = data.wallet;
              this.modalStatus = true;
              this.modalOpen = true;
              this.spinner = false;
            }
            if (data.walletVerif === 'success') {
              console.log('success');
              this.sendUserToStore(data);
              authHelp.saveAccessTokenLS(data.accessToken, null, null); // save accessToken to LocalStorage from autoLogin
            }
          }
        });
      }
    });
  }

  async emmitFromModal($event) {
    if ($event.btn === 'Save') {
      this.modalOpen = false;
      this.spinner = true;

      this.sendUserToStore(this.dataRegist);
      authHelp.saveAccessTokenLS(this.dataRegist.accessToken, null, null);  //? save accessToken to LocalStorage from autoLogin
    }

    if ($event.btn === 'Ok') {

      const pubKeyActual = await authHelp.generatePubKey($event.seedPh);

      if (this.walletFromDB === pubKeyActual.address) {
        authHelp.saveAccessTokenLS(null, pubKeyActual, $event.seedPh);
        this.authResultGlobal.pubKeyActual = pubKeyActual.address;
        this.loginSub$ = this.postService.post('user/auth0_login', this.authResultGlobal ).subscribe((data: any) => {

          if (data && data.walletVerif === 'success') {
            this.sendUserToStore(data);
            authHelp.saveAccessTokenLS(data.accessToken, null, null);
            this.spinner = true;
            this.modalOpen = false;
            const path = sessionStorage.getItem('betteryPath');
            this.router.navigate([path]);
          } else {
            // todo может очистить локал стор
            console.error('error from "user/auth0_login"');
          }
        });
      }
    }

    if ($event === 'Cancel') {
      const path = sessionStorage.getItem('betteryPath');
      this.router.navigate([path]);
    }
  }

  sendUserToStore(data): void {
    this.store.dispatch(new UserActions.AddUser({
      _id: data._id,
      email: data.email,
      nickName: data.nickName,
      wallet: data.wallet,
      avatar: data.avatar,
      verifier: data.verifier ? data.verifier : 'jwt',
      sessionToken: data.sessionToken,
      verifierId: data.verifierId,
      accessToken: data.accessToken
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
