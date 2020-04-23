import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/fontawesome-free-brands'
import { Store } from '@ngrx/store';
import { User } from '../../models/User.model';
import { AppState } from '../../app.state';
import * as UserActions from '../../actions/user.actions';
import { PostService } from '../../services/post.service';
import Web3 from 'web3';
import { Router } from "@angular/router";
import { FacebookLoginProvider, GoogleLoginProvider, AuthService, SocialUser } from "angularx-social-login";


@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.sass']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  submitted: boolean = false;
  faTimes = faTimes;
  registerError: string = undefined;
  web3: Web3 | undefined = null;
  metamaskError: string = undefined;
  userWallet: string = undefined;
  userWalletIsUndefinded: boolean = false;
  networkEror: boolean = false;
  validateSubscribe;
  loginWithMetamsk = false;
  faGoogle = faGoogle;
  faFacebook = faFacebook;


  @Output() regisModalEvent = new EventEmitter<boolean>();


  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private http: PostService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      nickName: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', Validators.email]
    });
    
    this.authService.authState.subscribe((user) => {
      console.log(user);
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
 
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  } 

  async loginMetamask() {
    this.loginWithMetamsk = true;
    // Check if MetaMask is installed
    if (!(window as any).ethereum) {
      this.metamaskError = "For registration you must have Metamask installed.";
      this.userWalletIsUndefinded = false
    } else {

      if (!this.web3) {
        try {
          await (window as any).ethereum.enable();
          window.web3 = new Web3(window.web3.currentProvider);
          this.web3 = new Web3(window.web3.currentProvider);
        } catch (error) {
          this.registrationModal()
          window.alert('You need to allow MetaMask.');
          return;
        }
      }

      const coinbase = await this.web3.eth.getCoinbase();
      if (!coinbase) {
        this.registrationModal()
        window.alert('Please activate MetaMask first.');
        return;
      } else {
        this.detectWalletInDB(coinbase, this.web3)

      }
    }
  }

  async detectWalletInDB(wallet: string, web3) {
    let checkNetwork = await web3._provider.networkVersion
    if(checkNetwork !== '4'){
     this.userWalletIsUndefinded = false;
     this.networkEror = true;
    }else{
      let data = {
        wallet: wallet
      }
      this.validateSubscribe = this.http.post("user/validate", data)
        .subscribe(
          (x: User) => {
            console.log(x);
            if (x.wallet === undefined) {
              this.userWallet = wallet;
              this.userWalletIsUndefinded = false
            } else {
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
                false,
                x.fakeCoins);
              // let getLocation = document.location.href
              // let gurd = getLocation.search("question")
              // if(gurd === -1){
              //   this.router.navigate(['~ki339203/eventFeed'])
              // }
            }
          },
          (err) => {
            console.log("validate user error")
            console.log(err);
          })
    }
  }

  registrationModal() {
    this.regisModalEvent.emit(false);
  }

  closeOutSide(event) {
    if (event.target.id === "close") {
      this.registrationModal();
    };
  }

  get f() { return this.registerForm.controls; }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  onSubmit() {
    this.submitted = true;
    let color = this.getRandomColor()

    if (this.registerForm.invalid) {
      return;
    }

    let data: User = {
      _id: null,
      nickName: this.registerForm.value.nickName,
      email: this.registerForm.value.email,
      wallet: this.userWallet,
      listHostEvents: [],
      listParticipantEvents: [],
      listValidatorEvents: [],
      historyTransaction: [],
      avatar: color,
      onlyRegistered: true,
      fakeCoins: 100
    }


    this.http.post("user/regist", data)
      .subscribe(
        (x: any) => {
          this.addUser(
            this.registerForm.value.email, 
            this.registerForm.value.nickName, 
            this.userWallet, 
            [], 
            [], 
            [], 
            [], 
            color, 
            x._id, 
            true,
            100
            );
          let getLocation = document.location.href
          let gurd = getLocation.search("question")
          if(gurd === -1){
            this.router.navigate(['~ki339203/eventFeed'])
          }
        },
        (err) => {
          this.registerError = err.error;
        })
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
    onlyRegistered: boolean,
    fakeCoins: number
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
      onlyRegistered: onlyRegistered,
      fakeCoins: fakeCoins
    }))
    this.onReset();
  }


  onReset() {
    this.submitted = false;
    this.registerForm.reset();
    this.registrationModal();
  }

  ngOnDestroy(){
    this.validateSubscribe.unsubscribe();
  }

}
