import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Store } from '@ngrx/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppState } from '../../../app.state';
import authHelp from '../../../helpers/auth-help';
import * as UserActions from '../../../actions/user.actions';
import { Subscription } from 'rxjs';
import { RegistrationComponent } from '../registration/registration.component';
import { WelcomePageComponent } from '../../share/both/modals/welcome-page/welcome-page.component';
import { environment } from '../../../../environments/environment';


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
  linkAccount$: Subscription;
  authResultGlobal: any;
  seedPhrase: object;
  walletFromDB;
  modalStatus: boolean;
  modalOpen: boolean;
  dataRegist: any;
  saveUserLocStorage = [];
  isCorrectPhrase: boolean;
  isRegistration = false;
  sub = undefined;

  constructor(
    private router: Router,
    private postService: PostService,
    private modalService: NgbModal,
    private store: Store<AppState>) {
    this.webAuth = authHelp.init;
    if (sessionStorage.getItem('linkUser') === 'linkUser') {
      this.auth0RegistrationWithLink();
    } else {
      this.auth0Registration();
    }
  }

  ngOnInit(): void {

  }

  auth0RegistrationWithLink() {
    sessionStorage.removeItem('linkUser');
    this.webAuth.parseHash({ hash: window.location.hash }, (err, authResult) => {
      if (err) {
        return console.log(err);
      }

      if (authResult) {
        this.linkAccount(authResult.idTokenPayload.sub);
      }
    });
  }

  async linkAccount(data) {
    const post = {
      verifierId: data
    };
    this.linkAccount$ = this.postService.post('user/link_account', post).subscribe((x) => {
      //? this.linkedDone.next([{status: 'done'}]);  update balance check
      this.goBack();
    }, (err) => {
      console.log(err);
    });
  }

  auth0Registration() {
    let wallet;
    let pubKey;
    let mnemonic;
    this.webAuth.parseHash({ hash: window.location.hash }, (err, userInfo) => {
      if (err) {
        return console.log(err);
      }
      this.sub = userInfo.idTokenPayload.sub;
      const pubKeyFromLS = authHelp.walletDectypt();
      if (pubKeyFromLS) {
        let userData = pubKeyFromLS.users.find((x) => { return x.sub == this.sub })
        if (userData) pubKey = userData.pubKey.address;
      }


      if (userInfo) {
        this.localStoreUser(userInfo);

        const dataForSend = {
          email: userInfo.idTokenPayload.email,
          nickname: userInfo.idTokenPayload.nickname,
          verifierId: this.sub,
          pubKey: pubKey,
          accessToken: userInfo.accessToken
        };
        this.authResultGlobal = dataForSend;
        this.loginSub$ = this.postService.post('user/auth0_login', dataForSend).subscribe(async (data: any) => {
          if (!data) {
            // == NEW USER ==
            await authHelp.walletInit(this.sub)
            wallet = authHelp.walletUser.pubKey;
            mnemonic = authHelp.walletUser.mnemonic;

            const refId = sessionStorage.getItem('bettery_ref');

            const newUser = {
              nickName: userInfo.idTokenPayload.nickname,
              email: userInfo.idTokenPayload.email,
              wallet,
              avatar: userInfo.idTokenPayload.picture,
              refId: refId ? refId : null,
              verifierId: userInfo.idTokenPayload.sub,
              accessToken: userInfo.accessToken
            };

            this.registerSub$ = this.postService.post('user/auth0_register', newUser).subscribe((x: any) => {
              this.dataRegist = x;
              if (x) {
                // ?  == show seed phrase ==
                this.modalOpen = true;
                this.modalStatus = false;
                this.spinner = false;
                this.seedPhrase = { mnemonic, wallet };
              }
            }, error => {
              console.log(error.message);
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
              authHelp.saveAccessTokenLS(data.accessToken, null, null, this.sub);

              const walletDectypt = authHelp.walletDectypt();
              let userData = walletDectypt.users.find((x) => { return x.sub == walletDectypt.login })

              const setMemoData = {
                mnemonic: userData.mnemonic,
                pubKey: {
                  address: userData.wallet
                }
              };
              authHelp.setMemo(setMemoData);
            }
          }
        }, (error) => {
          if (error.status === 302) {
            console.log('error', error.status);
          } else {
            console.log(error);
          }
        });
      }
    });
  }

  async emmitFromModal($event) {
    if ($event.btn === 'Save') {
      this.modalOpen = false;
      this.spinner = true;

      const setMemoData = {
        mnemonic: $event.seedPh.mnemonic,
        pubKey: {
          address: $event.seedPh.wallet
        }
      };
      authHelp.setMemo(setMemoData);
      this.sendUserToStore(this.dataRegist);
      authHelp.saveAccessTokenLS(this.dataRegist.accessToken, null, null, this.sub);  //? save accessToken to LocalStorage from autoLogin
    }

    if ($event.btn === 'Ok') {
      const pubKeyActual = await authHelp.generatePubKey($event.seedPh);

      if (pubKeyActual.address === 'not correct') {
        this.isCorrectPhrase = true;
      }
      if (this.walletFromDB === pubKeyActual.address) {
        this.isCorrectPhrase = false;
        this.authResultGlobal.pubKeyActual = pubKeyActual.address;
        this.loginSub$ = this.postService.post('user/auth0_login', this.authResultGlobal).subscribe((data: any) => {

          if (data && data.walletVerif === 'success') {
            const setMemoData = {
              mnemonic: $event.seedPh,
              pubKey: pubKeyActual
            };
            authHelp.setMemo(setMemoData);
            this.sendUserToStore(data);
            authHelp.saveAccessTokenLS(data.accessToken, pubKeyActual, $event.seedPh, this.sub);
            this.spinner = true;
            this.modalOpen = false;
            this.goBack();
          } else {
            console.error('error from "user/auth0_login"');
          }
        }, (error) => {
          if (error.status == 302) {
            this.goBack();
            const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
            modalRef.componentInstance.alreadyRegister = error.error;
          } else {
            console.log(error);
          }
        });
      } else {
        this.isCorrectPhrase = true;
      }
    }

    if ($event.btn === 'Cancel') {
      this.webAuth.logout({
        client_id: environment.clientId,
        returnTo: `${environment.auth0_URI}/join#logout`
      });
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
    this.goBack();
  }

  localStoreUser(userInfo): void {
    if (localStorage.getItem('userBettery') === undefined || localStorage.getItem('userBettery') == null) {
      localStorage.setItem('userBettery', JSON.stringify(this.saveUserLocStorage));
    }
    const getItem = JSON.parse(localStorage.getItem('userBettery'));

    if (getItem.length === 0 || !getItem.includes(userInfo.idTokenPayload.email)) {
      const array = JSON.parse(localStorage.getItem('userBettery'));
      array.push(userInfo.idTokenPayload.email);

      localStorage.setItem('userBettery', JSON.stringify(array));

      const myModal = this.modalService.open(WelcomePageComponent, {centered: true});
      this.isRegistration = true;
      myModal.result.then((() => {
      }), () => {
        this.isRegistration = false;
      });
    }
  }

  goBack(): void {
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
    if (this.linkAccount$) {
      this.linkAccount$.unsubscribe();
    }
  }
}
