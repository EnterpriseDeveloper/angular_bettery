import MetaTransaction from './metaTransaction';
import web3Obj from '../helpers/torus';
import Web3 from 'web3';
import BTYMain from '../../../build/contracts/BTYmain.json';
import networkConfiguration from '../config/network.json'
import configFile from '../config/config.json';
import configMaticMumbai from '../config/matic.json'; // TODO switch to prodaction
import PublicEventsJSON from '../../../build/contracts/PublicEvents.json';
import RootChainManager from '../../../build/contracts/RootChainManager.json';
import BTY from '../../../build/contracts/BTY.json';
import BET from '../../../build/contracts/BET.json';

export default class Contract extends MetaTransaction {

    async getBTYtokenMainChain(network) {
        let web3 = new Web3(network);
        let abi: any = BTYMain.abi
        return new web3.eth.Contract(abi,
            BTYMain.networks[networkConfiguration.goerli].address)
    }

    async getBTYTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBTY: any = BTY.abi;
        return new web3.eth.Contract(abiBTY, BTY.networks[networkConfiguration.maticMumbai].address);
    }

    async getBETTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBET: any = BET.abi;
        return new web3.eth.Contract(abiBET, BET.networks[networkConfiguration.maticMumbai].address);
    }

    publicEventAddress() {
        return PublicEventsJSON.networks[networkConfiguration.maticMumbai].address;
    }

    erc20PredicateAddr() {
        return configMaticMumbai.Main.POSContracts.ERC20PredicateProxy;
    }

    rootChainManagerProxyAddr() {
        return "0x57823134bc226b2335CA2E6D03c8E59a8314b2A9"
     //   return configMaticMumbai.Main.POSContracts.RootChainManagerProxy;
    }

    rootChainManagerAddr() {
        return configMaticMumbai.Main.POSContracts.RootChainManager;
    }

    async approveBTYmainToken(userWallet, amount, from, provider) {
        console.log(provider)
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BTYMainContr = await this.getBTYtokenMainChain(provider); // TODO switch if will use more that one wallet
        let functionSignature = await BTYMainContr.methods.approve(this.erc20PredicateAddr(), amount).encodeABI();
        let nonce = await BTYMainContr.methods.getNonce(userWallet).call();
        const tokenName = "BET_main";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BTYMain.networks[networkConfiguration.goerli].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYMainContr, functionSignature)
    }

    async deposit(userWallet, amount, from, provider) {
        console.log(provider)
        let web3 = new Web3(provider);
        let web3_2 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        const depositData = web3.eth.abi.encodeParameter('uint256', amount);
        console.log(depositData)
        const BTYMainAddr = BTYMain.networks[networkConfiguration.goerli].address;
        //const BTYMainAddr = "0xf1a5c13e3ED219F705cEf4B4f52492711eaaa08a";
        const abi: any = RootChainManager.abi;
        let rCMP = new web3.eth.Contract(abi, this.rootChainManagerProxyAddr());
        let functionSignature = await rCMP.methods.depositFor(userWallet, BTYMainAddr, depositData).encodeABI();
        let nonce = await rCMP.methods.getNonce(userWallet).call();
        console.log(nonce)
        const tokenName = "RootChainManager";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, this.rootChainManagerProxyAddr(), nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3_2, rCMP, functionSignature)

    }

    async approveBTYToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BTYToken = await this.getBTYTokenContract();
        let functionSignature = await BTYToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BTYToken.methods.getNonce(userWallet).call();
        const tokenName = "BTY_token";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BTY.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYToken, functionSignature)
    }

    async approveBETToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BETToken = await this.getBETTokenContract();
        let functionSignature = await BETToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BETToken.methods.getNonce(userWallet).call();
        const tokenName = "BET_token";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BET.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BETToken, functionSignature)
    }

    async swipeTokens(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BTYToken = await this.getBTYTokenContract();
        let functionSignature = await BTYToken.methods.swipe(amount).encodeABI();
        let nonce = await BTYToken.methods.getNonce(userWallet).call();
        const tokenName = "BTY_token";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BTY.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYToken, functionSignature)
    }

    async getUserAccount(from) {
        let goerli = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider)
        let accounts = await goerli.eth.getAccounts();
        return accounts[0];
    }

}

// OLD CODE
    // async withdrawalWETHToken(userWallet, amount, from) {
    //     let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
    //     let WETHToken = await this.getWETHContract();
    //     let functionSignature = await WETHToken.methods.withdraw(amount).encodeABI();
    //     console.log(functionSignature)
    //     let nonce = await WETHToken.methods.getNonce(userWallet).call();
    //     const tokenName = await WETHToken.methods.name().call();
    //     let dataToSign = this.dataToSignFunc(tokenName, configFile.child.MaticWETH, nonce, userWallet, functionSignature)
    //     let burnTxHash = await this.setSignPromise(userWallet, dataToSign, web3, WETHToken, functionSignature);
    //     console.log(burnTxHash);
    //     let burnTx = burnTxHash.transactionHash;
    //     let getSing = await buildPayloadForExit(String(burnTx), from, web3);
    //     let rootContract = await this.RootChainManagerContract(from)
    //     let message = await rootContract.methods.exit(getSing).encodeABI();
    //     console.log(message)
    //     var signature = await web3.eth.personal.sign(message, userWallet);
    //     console.log(signature);
    //     return { withdrawal: burnTxHash, sign: signature }
    // }

    // async RootChainManagerContract(from) {
    //     let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider)
    //     let abi = RootChainManagerJSON.abi
    //     return new web3.eth.Contract(abi, "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74")
    // }
