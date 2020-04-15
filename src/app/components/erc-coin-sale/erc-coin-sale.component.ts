import { Component, OnInit } from '@angular/core';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import Web3 from 'web3';
import TokenSaleJSON from '../../../../build/contracts/QuizeTokenSale.json';
import TokenJSON from '../../../../build/contracts/EthERC20Coin.json'; 
import networkConfigs from '../../../network-configs.json'


@Component({
  selector: 'erc-coin-sale',
  templateUrl: './erc-coin-sale.component.html',
  styleUrls: ['./erc-coin-sale.component.sass']
})
export class ErcCoinSaleComponent implements OnInit {
  private tokenPricePrivate: number = 0;

  tokenPrice: number = 0.001;
  tokenOwner: any = 0;
  progressToken: number = 0
  tokenSold: number = 0;
  metamaskError: string = undefined
  web3: Web3 | undefined = null;
  token: any = null;
  tokensAvailable: number = 750000000;
  tokenSale: any = null;
  numberOfTokens = 1;
  numberError: boolean = false
  spinner: boolean = true;
  userWallet = null;
  buyTokensMessage: boolean = false;
  transferButton: boolean = false;

  constructor(config: NgbProgressbarConfig) {
    config.max = 100;
    config.striped = true;
    config.animated = true;
  }

  ngOnInit() {
    this.initMetamask()
  }

  async initMetamask() {
    if (!(window as any).ethereum) {
      this.metamaskError = "For buy coins you must have Metamask installed.";
      this.spinner = false;
    } else {
      if (!this.web3) {
        try {
          await (window as any).ethereum.enable();
          window.web3 = new Web3(window.web3.currentProvider);
          this.web3 = new Web3(window.web3.currentProvider);
        } catch (error) {
          this.metamaskError = 'You need to allow MetaMask.';
          this.spinner = false;
          return;
        }
      }
      const coinbase = await this.web3.eth.getCoinbase();
      if (!coinbase) {
        this.metamaskError = 'Please activate MetaMask first.'
        this.spinner = false;
        return;
      } else {
        this.userWallet = coinbase;
        // for testing! Need create better solition for detect owner of smart contract.
        this.transferButton = this.userWallet == "0xF02B362cBEFC2d5bD5f7C3dBdbD0DE84508525D5".toLowerCase() ? true : false
        this.sellContract(coinbase);
        this.tokenContract(coinbase);
      }
    }
  }

  async sellContract(wallet) {
    // better to move new this.web3.eth.Contract to contract folder
    let abiTokenSale: any = TokenSaleJSON.abi
    this.tokenSale = new this.web3.eth.Contract(abiTokenSale,
      TokenSaleJSON.networks[networkConfigs.networks.rinkeby.networkId].address)

    let tokenSold = await this.tokenSale.methods.tokensSold().call();
    let web3 = new Web3();
    this.tokenSold = Number(web3.utils.fromWei(tokenSold, 'ether'));

    this.progressToken = (Math.ceil(this.tokenSold) / this.tokensAvailable) * 100;

    let price = await this.tokenSale.methods.tokenPrice().call();
    this.tokenPricePrivate = Number(price);
    console.log(this.tokenPricePrivate)
    this.tokenPrice = Number(this.web3.utils.fromWei(price, "ether"));

    // Detect Sell event
    this.tokenSale.events.Sell(async (err, event) => {
      if (err) {
        console.log(err)
      } else {
        console.log(event)
        this.sellContract(wallet);
        this.tokenContract(wallet);
      }
    })
  }

  async tokenContract(wallet) {
    // better to move new this.web3.eth.Contract to contract folder
    let abiTokenSale: any = TokenJSON.abi
    this.token = new this.web3.eth.Contract(abiTokenSale,
      TokenJSON.networks[networkConfigs.networks.rinkeby.networkId].address)

    let avaliableTokens = await this.token.methods.balanceOf(wallet).call();
    console.log(avaliableTokens);
    let tokens = this.web3.utils.fromWei(avaliableTokens, 'ether'); 
    this.tokenOwner = tokens;
    this.spinner = false;
    this.buyTokensMessage = false;
  }

  async buyToken() {
    if (this.numberOfTokens <= 0) {
      this.numberError = true
    } else {
      this.numberError = false
      try {
        this.buyTokensMessage = true;
        this.spinner = true;
        let web3 = new Web3()
        let amount = web3.utils.toWei(String(this.numberOfTokens), 'ether');
        await this.tokenSale.methods.buyTokens(amount).send({
          from: this.userWallet,
          value: this.numberOfTokens * this.tokenPricePrivate,
          gas: 500000
        })

      } catch (err) {
        this.spinner = false;
        this.buyTokensMessage = false;
        if (err.code !== 4001) {
          this.metamaskError = 'Something went wrong check console';
        }
        console.log(err);
      }
    }
  }

  // transfer tokens. Avaliable only for owners
  async transferToken(){
   let web3 = new Web3()
   let amount = web3.utils.toWei('750000000', 'ether');
   let address = TokenSaleJSON.networks[networkConfigs.networks.rinkeby.networkId].address
   let test = await this.token.methods.transfer(address, amount).send({
     from: this.userWallet,
   })
   console.log(test);
  }

}