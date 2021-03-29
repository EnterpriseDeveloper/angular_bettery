import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
import { WelcomePageComponent } from '../share/welcome-page/welcome-page.component';
import biconomyInit from '../../../app/contract/biconomy';
import biconomyMainInit from '../../../app/contract/biconomyMain';


@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.sass']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  @Input() openSpinner = false;
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
      nickName: ['', Validators.minLength(6)],
      email: ['', [Validators.email, Validators.required]]
    });
    if (this.openSpinner === true) {
      this.loginWithTorus();
    }
  }

  async loginWithTorus() {
    this.spinner = true;
    // this.activeModal.dismiss('Cross click')
    await biconomyMainInit();
    await biconomyInit();
    try {
      await web3Obj.initialize();
      this.setTorusInfoToDB();
    } catch (error) {
      this.spinner = false;
      this.closeModal();
      await web3Obj.torus.cleanUp()
      console.error(error);
    }
  }

  async setTorusInfoToDB() {
    let userInfo = await web3Obj.torus.getUserInfo('');
    let userWallet = (await web3Obj.web3.eth.getAccounts())[0];

    this.localStoreUser(userInfo);

    let refId = sessionStorage.getItem('bettery_ref')

    let data: Object = {
      _id: null,
      wallet: userWallet,
      nickName: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.profileImage,
      verifier: userInfo.verifier,
      verifierId: userInfo.verifierId,
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
          await web3Obj.torus.cleanUp()
          console.log(err);
        });
  }

  closeModal() {
    this.activeModal.dismiss('Cross click');
  }

  get f() {
    return this.registerForm.controls;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  addUser(
    email: string,
    nickName: string,
    wallet: string,
    listHostEvents: Object,
    listParticipantEvents: Object,
    listValidatorEvents: Object,
    historyTransaction: Object,
    color: string,
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
      avatar: color,
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
      this.modalService.open(WelcomePageComponent);
    }
  }

  ngOnDestroy() {
    if (this.torusRegistSub) {
      this.torusRegistSub.unsubscribe();
    }
  }

}
