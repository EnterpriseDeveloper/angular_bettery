import {Component, OnDestroy, Input, HostListener, Output, EventEmitter} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.state';
import {PostService} from '../../../services/post.service';
import Web3 from 'web3';
import {Router} from '@angular/router';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subscription} from 'rxjs';
import authHelp from '../../../helpers/auth-help';


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
  @Input() alreadyRegister = undefined;
  webAuth: any;

  constructor(
    private store: Store<AppState>,
    private http: PostService,
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {
    this.webAuth = authHelp.init;
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.close();
  }

  loginWithAuth0(param: string) {
    if (this.linkUser) {
      if (!this.linVerification(param)) {
        sessionStorage.setItem('linkUser', 'linkUser');
        param = param === 'email' ? null : param;
        this.webAuth.authorize({
          connection: param,
        });
        sessionStorage.setItem('betteryPath', window.location.pathname);
      }
    }else {
      param = param === 'email' ? null : param;
      this.webAuth.authorize({
        connection: param,
      });
      sessionStorage.setItem('betteryPath', window.location.pathname);
    }
  }


  async linkAccount(data) {
    let post = {
      verifierId: data.userInfo.verifierId
    };
    this.linkSub = this.http.post('user/link_account', post).subscribe((x) => {
      this.linkedDone.next([{status: 'done'}]);
      this.activeModal.dismiss('Cross click');
      this.spinner = false;
    }, (err) => {
      console.log(err);
    });
  }

  linVerification(x) {
    let z = x == 'google-oauth2' ? 'google' : x;
    return this.linkedAccouns.includes(z);
  }

  goBack() {
    this.alreadyRegister = undefined;
  }

  alreadyRegistCloseModal() {
    this.closeModal();
  }


  closeModal() {
    this.closedWindow.next();
    this.activeModal.dismiss('Cross click');
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
