import { Component, OnDestroy, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../../models/User.model';
import { AppState } from '../../app.state';
import * as UserActions from '../../actions/user.actions';
import { PostService } from '../../services/post.service';
import Web3 from 'web3';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import web3Obj from '../../helpers/torus';
import { Subscription } from 'rxjs';
import { WelcomePageComponent } from '../share/both/modals/welcome-page/welcome-page.component';


@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.sass']
})
export class RegistrationComponent implements OnDestroy {
  @Input() openSpinner = false;
  @Input() linkUser = false;
  @Input() linkedAccouns = [];
  @Output() linkedDone = new EventEmitter<Object[]>();
  @Output() closedWindow = new EventEmitter();

  submitted: boolean = false;
  registerError: any = undefined;
  web3: Web3 | undefined = null;
  metamaskError: string = undefined;
  userWallet: string = undefined;
  validateSubscribe: Subscription;
  torusRegistSub: Subscription;
  linkSub: Subscription;
  spinner: boolean;
  saveUserLocStorage = [];
  alreadyRegister = undefined;

  constructor(
    private store: Store<AppState>,
    private http: PostService,
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {
    web3Obj.init();
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.close();
  }

  async loginWithTorus(selectedVerifier) {
    if (this.linkUser) {
      if (!this.linVerification(selectedVerifier)) {
        this.spinner = true;
        let { data, err } = await web3Obj.linkUser(selectedVerifier);
        if (!err) {
          await this.linkAccount(data);
        } else {
          this.logOut(err);
        }
      }
    } else {
      this.spinner = true;
      let login = await web3Obj.login(selectedVerifier);
      if (login == null) {
        this.setTorusInfoToDB();
      } else {
        this.logOut(login);
      }
    }
  }

  async logOut(x) {
    if (JSON.stringify(x).search("user closed popup") != -1) {
      this.closedWindow.next();
    }
    this.spinner = false;
    this.closeModal();
    await web3Obj.logOut();
  }

  async linkAccount(data) {
    let post = {
      verifierId: data.userInfo.verifierId
    }
    this.linkSub = this.http.post("user/link_account", post).subscribe((x) => {
      this.linkedDone.next([{ status: "done" }])
      this.activeModal.dismiss('Cross click');
      this.spinner = false;
    }, (err) => {
      console.log(err)
    })
  }

  linVerification(x) {
    let z = x == 'google-oauth2' ? 'google' : x;
    return this.linkedAccouns.includes(z);
  }

  async setTorusInfoToDB() {
    let userInfo = web3Obj.loginDetails;
    if (userInfo != null) {
      console.log(userInfo);

      this.localStoreUser(userInfo.userInfo);

      let refId = sessionStorage.getItem('bettery_ref')

      let data: Object = {
        _id: null,
        wallet: userInfo.publicAddress,
        nickName: userInfo.userInfo.name,
        email: userInfo.userInfo.email,
        avatar: userInfo.userInfo.profileImage,
        verifier: userInfo.userInfo.typeOfLogin,
        verifierId: userInfo.userInfo.verifierId,
        refId: refId == null ? 'undefined' : refId,
        accessToken: userInfo.userInfo.accessToken,
      };

      this.torusRegistSub = this.http.post('user/torus_regist', data)
        .subscribe(
          (x: User) => {
            this.store.dispatch(new UserActions.AddUser({
              _id: x._id,
              email: x.email,
              nickName: x.nickName,
              wallet: x.wallet,
              avatar: x.avatar,
              verifier: x.verifier,
              sessionToken: x.sessionToken,
              verifierId: x.verifierId,
              accessToken: x.accessToken
            }));
            this.spinner = false;
            this.alreadyRegister = undefined;
            this.submitted = false;
            this.activeModal.dismiss('Cross click');
          }, async (err) => {
            if (err.status == 302) {
              this.alreadyRegister = err.error;
              this.spinner = false;
            } else {
              this.activeModal.dismiss('Cross click');
              this.spinner = false;
              console.log(err);
            }
          });
    }
  }

  goBack() {
    this.alreadyRegister = undefined;
  }

  alreadyRegistCloseModal() {
    web3Obj.logOut();
    this.closeModal();
  }


  closeModal() {
    this.closedWindow.next();
    this.activeModal.dismiss('Cross click');
  }

  localStoreUser(userInfo): void {
    if (localStorage.getItem('userBettery') === undefined || localStorage.getItem('userBettery') == null) {
      localStorage.setItem('userBettery', JSON.stringify(this.saveUserLocStorage));
    }
    const getItem = JSON.parse(localStorage.getItem('userBettery'));
    if (getItem.length === 0 || !getItem.includes(userInfo.email)) {
      const array = JSON.parse(localStorage.getItem('userBettery'));
      array.push(userInfo.email);
      localStorage.setItem('userBettery', JSON.stringify(array));
      this.modalService.open(WelcomePageComponent, { centered: true });
    }
  }

  ngOnDestroy() {
    if (this.torusRegistSub) {
      this.torusRegistSub.unsubscribe();
    }
    if (this.linkSub) {
      this.linkSub.unsubscribe();
    }
  }
}
