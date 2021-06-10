import { Component, OnInit, OnDestroy, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
export class RegistrationComponent implements OnInit, OnDestroy {
  @Input() openSpinner = false;
  @Input() linkUser = false;
  @Input() linkedAccouns = [];
  @Output() linkedDone = new EventEmitter<Object[]>();

  registerForm: FormGroup;
  submitted: boolean = false;
  registerError: any = undefined;
  web3: Web3 | undefined = null;
  metamaskError: string = undefined;
  userWallet: string = undefined;
  validateSubscribe: Subscription;
  torusRegistSub: Subscription;
  spinner: boolean;
  saveUserLocStorage = [];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private http: PostService,
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
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
    console.log(x)
    this.spinner = false;
    this.closeModal();
    await web3Obj.logOut();
  }

  async linkAccount(data) {
    // TODO send to db
    console.log(data);
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
        refId: refId == null ? 'undefined' : refId
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
              x.verifier
            );
            this.spinner = false;
          }, async (err) => {
            this.closeModal();
            this.spinner = false;
            console.log(err);
          });
    }
  }

  closeModal() {
    this.activeModal.dismiss('Cross click');
  }

  get f() {
    return this.registerForm.controls;
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
    verifier: string
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
      verifier: verifier
    }));
    this.onReset();
  }


  onReset() {
    this.submitted = false;
    this.registerForm.reset();
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
  }

  sendForm() {
    this.submitted = true;
    if (this.registerForm.controls.email.valid) {
      console.log(this.registerForm.controls.email.value);
    }
  }
}
