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
import { WelcomePageComponent } from '../share/modals/welcome-page/welcome-page.component';
import biconomyInit from '../../../app/contract/biconomy';


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
  alreadyRegister = [];

  constructor(
    private store: Store<AppState>,
    private http: PostService,
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) { }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.close();
  }

  async loginWithTorus(selectedVerifier) {
    console.log(selectedVerifier)
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
      await biconomyInit();
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
    console.log(data);
    let post = {
      verifierId: data.userInfo.verifierId
    }
    this.linkSub = this.http.post("user/link_account", post).subscribe((x) => {
      //TODO update users
      this.closeModal();
      this.spinner = false;
    }, (err) => {
      console.log(err)
    })
    this.linkedDone.next([{ status: "done" }])
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
            this.addUser(
              x.email,
              x.nickName,
              x.wallet,
              x.listHostEvents,
              x.listParticipantEvents,
              x.listValidatorEvents,
              x.historyTransaction,
              x.avatar,
              x._id,
              x.verifier,
              x.sessionToken,
              x.verifierId,
              x.accessToken = userInfo.userInfo.accessToken
            );
            this.spinner = false;
            this.alreadyRegister = [];
          }, async (err) => {
            if (err.status == 302) {
              this.alreadyRegister = err.error;
              this.spinner = false;
            } else {
              this.closeModal();
              this.spinner = false;
              console.log(err);
            }
          });
    }
  }

  goBack() {
    this.alreadyRegister = [];
  }

  alreadyRegistCloseModal() {
    web3Obj.logOut();
    this.closeModal();
  }


  closeModal() {
    this.closedWindow.next();
    this.activeModal.dismiss('Cross click');
  }

  addUser(
    email: string,
    nickName: string,
    wallet: string,
    listHostEvents: Object,
    listParticipantEvents: Object,
    listValidatorEvents: Object,
    historyTransaction: Object,
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
      listHostEvents: listHostEvents,
      listParticipantEvents: listParticipantEvents,
      listValidatorEvents: listValidatorEvents,
      historyTransaction: historyTransaction,
      avatar: avatar,
      verifier: verifier,
      sessionToken: sessionToken,
      verifierId: verifierId,
      accessToken: accessToken
    }));
    this.onReset();
  }


  onReset() {
    this.submitted = false;
    this.closeModal();
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
