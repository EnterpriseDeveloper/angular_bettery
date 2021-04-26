import { Component, OnInit, OnDestroy } from '@angular/core';
import Web3 from 'web3';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import USDTToken from '../../../../build/contracts/IERC20.json';
import TokenSale from '../../../../build/contracts/QuizeTokenSale.json';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MetaMaskModalComponent } from '../share/meta-mask-modal/meta-mask-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TokenSaleInfo} from '../../models/TokenSaleInfo.model';

@Component({
  selector: 'erc-coin-sale',
  templateUrl: './erc-coin-sale.component.html',
  styleUrls: ['./erc-coin-sale.component.sass']
})
export class ErcCoinSaleComponent implements OnInit, OnDestroy {
  web3: Web3 | undefined = null;
  postServiceSub: Subscription;
  numberOfTokens = undefined;

  tokensaleInfo: TokenSaleInfo;
  spinner: boolean = false;

  percent: number;
  time: any;
  timer: any;
  timeInterval: any;

  form: FormGroup;
  submitted: boolean = false;
  subscribed: boolean = false;
  subscribedPost: Subscription;
  slideIndex = 0;
  afterSubType: boolean = false;

  constructor(
    public postService: PostService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async ngOnInit() {
    console.log(environment.production);
    this.getDataFromDb();
    this.setClock(1617235200);
  }

  getDataFromDb() {
    let data = {
      from: 'dev'
    };
    this.postServiceSub = this.postService.post('tokensale/info', data).subscribe((x: TokenSaleInfo) => {
      this.tokensaleInfo = x;
    }, (err) => {
      console.log(err);
    });
  }

  async connectToMetamask() {
    // Check if MetaMask is installed
    this.spinner = true;
    if (!(window as any).ethereum) {
      this.openMetamaskModal("Please install Metamask in your browser to proceed.", "Metamask required!");
      this.spinner = false;
    } else {
      if (!this.web3) {
        try {
          await (window as any).ethereum.enable();
          window.web3 = new Web3(window.web3.currentProvider);
          this.web3 = new Web3(window.web3.currentProvider);
        } catch (error) {
          this.openMetamaskModal("Please allow Metamask to access to the webpage.", 'access needed');
          this.spinner = false;
        }
      }
      const coinbase = await this.web3.eth.getCoinbase();
      if (!coinbase) {
        this.openMetamaskModal('Please activate MetaMask first.', 'access needed');
        this.spinner = false;
        return;
      } else {
        let checkNetwork = await window.web3._provider.networkVersion;
        if (checkNetwork != '5') {
          this.openMetamaskModal('Plaese switch your network in MetaMask to the Goerli network.', 'access needed');
          this.spinner = false;
        } else {
          this.buyToken(coinbase);
        }
      }
    }
  }


  async buyToken(wallet) {
    try {
      let networkId = 5;
      let tokenSaleAddress = TokenSale.networks[networkId].address;
      let tokenAddress = '0xFCf9F99D135D8a78ab60CC59CcCF3108E813bA35';
      let number = (Number(this.numberOfTokens) * Number(this.tokensaleInfo.price)).toFixed(4)
      let usdtContract = await this.connectToContract(wallet, USDTToken, tokenAddress);
      let approveAmount = this.web3.utils.toWei(String(number), 'mwei');
      let approve = await usdtContract.methods.approve(tokenSaleAddress, approveAmount).send();
      console.log(approve);

      let tokenSaleContract = await this.connectToContract(wallet, TokenSale.abi, tokenSaleAddress);
      let tokensAmount = this.web3.utils.toWei(String(this.numberOfTokens), 'ether');
      let buy = await tokenSaleContract.methods.buyTokens(tokensAmount).send();
      console.log(buy);
      this.numberOfTokens = 0;
      this.getDataFromDb();
      this.spinner = false;
    } catch (err) {
      this.openMetamaskModal(err.message, 'Network error');
      this.spinner = false;
      console.log(err);
    }
  }

  async connectToContract(account, contract, address) {
    return new this.web3.eth.Contract(contract, address, { from: account });
  }

  ngOnDestroy() {
    if (this.postServiceSub) {
      this.postServiceSub.unsubscribe();
    }
  }

  calculatePercenta(num1, num2) {
    const ver = (num1 / num2) * 100;
    if (isNaN(Math.round(ver))) {
      this.percent = 0;
      return this.percent;
    } else {
      this.percent = Math.round(ver);
      return this.percent;
    }
  }

  showPercentSlid() {
    // return { 'left': this.percent + '%' };
    return { 'left': 0 + '%' };
  }

  yellowLineW() {
    // return { 'width': this.percent + '%' };
    return  { 'width': 0 + '%' };
  }

  openMetamaskModal(message, title) {
    const modalRef = this.modalService.open(MetaMaskModalComponent, { centered: true });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.title = title;
  }


  updateClock(endTime) {
    this.time = new Date();
    this.time = Date.parse(this.time) / 1000;

    let t = endTime - this.time,
      days = Math.floor(t / (60 * 60 * 24)),
      seconds = Math.floor(t % 60),
      minutes = Math.floor((t / 60 % 60)),
      hours = Math.floor(t / (60 * 60) % 24);
    this.timer = {
      'total': t,
      days: this.getZero(days),
      seconds: this.getZero(seconds),
      minutes: this.getZero(minutes),
      hours: this.getZero(hours)
    };

    if (this.timer?.total <= 0) {
      clearInterval(this.timeInterval);
    }
  }

  setClock(endTime) {
    this.timeInterval = setInterval(() => this.updateClock(endTime), 1000);
    this.updateClock(endTime);
  }

  getZero = (num) => {
    return num >= 0 && num < 10 ? '0' + num : num.toString();
  }

  checkValidBtn() {
    return this.numberOfTokens === undefined ||
      this.numberOfTokens <= 0 ||
      this.numberOfTokens > Number(this.tokensaleInfo.balance);
  }

  get f() {
    return this.form.controls;
  }

  subscribe() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    this.afterSubType = true;
    let data = {
      email: this.form.value.email,
      from: "tokensale"
    }
    this.subscribedPost = this.postService.post("subscribe", data).subscribe((x) => {
      this.submitted = false;
      this.subscribed = true;
    }, (err) => {
      console.log(err);
    })
  }

  onSwiper($event: any) {
    this.slideIndex = $event.activeIndex;
  }
}
